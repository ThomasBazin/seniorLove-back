import { User, Hobby, Event, User_hobby } from '../models/index.js';
import Joi from 'joi';
import { isActiveUser } from '../utils/checkUserStatus.js';
import { Op } from 'sequelize';
import computeAge from '../utils/computeAge.js';
import { Scrypt } from '../auth/Scrypt.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { userPhotoStorage } from '../cloudinary/index.js';
// Configure Multer to use Cloudinary storage
multer({ storage: userPhotoStorage });

// Créer un utilisateur
export async function createUser(req, res) {
  // Joi schema configuration (no picture in schema)
  const registerSchema = Joi.object({
    name: Joi.string().max(50).required(),
    birth_date: Joi.date().required(),
    description: Joi.string(),
    gender: Joi.string().max(10).valid('male', 'female', 'other').required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string()
      .min(12)
      .max(36)
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,36}$/)
      .messages({
        'string.base': 'password must be a string',
        'string.min': 'password must be at least 12 characters',
        'string.max': 'password must be less than 36 characters',
        'string.empty': 'password should not be empty',
        'any.required': 'password is required',
        'string.pattern.base':
          'password should contain at least one uppercase letter, one lowercase letter, one digit and one special character',
      })
      .required(),
    repeat_password: Joi.valid(Joi.ref('password')).required(),
    hobbies: Joi.array().items(Joi.number().integer().min(1)).required(),
  });

  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // Age control using custom function
  if (computeAge(req.body.birth_date) < 60) {
    return res.status(400).json({ message: 'must be over 60 to register' });
  }

  const { repeat_password, email } = req.body;

  // Check if email already exists
  const potentialExistingUser = await User.findOne({ where: { email: email } });
  if (potentialExistingUser) {
    return res.status(400).json({ message: 'e-mail already registered' });
  }

  // Handle file upload (picture)
  if (!req.file.path || !req.file.filename) {
    return res.status(400).json({ message: 'picture must be included' });
  }

  const { path: picture, filename: picture_id } = req.file;

  const userInfos = req.body;

  const newUser = await User.create({
    ...userInfos,
    picture,
    picture_id,
    password: Scrypt.hash(repeat_password),
  });

  await newUser.addHobbies(req.body.hobbies);

  res.status(201).end();
}
//Récupérer tous les utilisateurs
export async function getAllUsers(req, res) {
  const excludedUserId = req.user.userId;
  //const excludedStatuses = ['pending', 'banned'];

  const allUsers = await User.findAll({
    where: {
      status: 'active',
      id: { [Op.not]: excludedUserId },
    },
    attributes: ['id', 'name', 'birth_date', 'picture'],
  });

  // Map over the users and add the computed age
  const usersWithAge = allUsers.map((user) => ({
    // Convert Sequelize model instance to a plain object
    ...user.toJSON(),
    // Add computed age
    age: computeAge(user.birth_date),
  }));

  res.status(200).json(usersWithAge);
}

//Récupérer un utilisateur
export async function getOneUser(req, res) {
  // Get the userId in params, and check if it's a number
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

  // Get my id and check if i'm active
  const myId = parseInt(req.user.userId, 10);
  if (!(await isActiveUser(myId))) {
    return res.status(401).json({ blocked: true });
  }

  // Get the user in DB
  const foundUser = await User.findByPk(userId, {
    include: [
      { association: 'hobbies', attributes: ['id', 'name'] },
      {
        association: 'events',
        attributes: ['id', 'name', 'location', 'picture', 'date', 'time'],
      },
    ],
  });

  // Make sure user is found and is active
  if (
    !foundUser ||
    foundUser.status === 'banned' ||
    foundUser.status === 'pending'
  ) {
    return res.status(404).json({ message: 'user not found' });
  }

  // Extract only necessary infos from user to be sent
  const {
    id,
    name,
    birth_date,
    description,
    gender,
    picture,
    hobbies,
    events,
  } = foundUser;

  // Prepare new object with usefull infos and send it
  const userProfileToSend = {
    id,
    name,
    birth_date,
    age: computeAge(birth_date),
    description,
    gender,
    picture,
    hobbies,
    events,
  };
  res.status(200).json(userProfileToSend);
}

//Récupérer l'utilisateur connecté
export async function getConnectedUser(req, res) {
  // Get my id and make sure it's a number
  const myId = parseInt(req.user.userId, 10);

  // Get my profile in DB, including my events and my hobbies
  const me = await User.findByPk(myId, {
    attributes: [
      'id',
      'name',
      'birth_date',
      'description',
      'gender',
      'picture',
      'email',
      'status',
    ],
    include: [
      {
        association: 'events',
        attributes: ['id', 'name', 'location', 'picture', 'date', 'time'],
      },
      {
        association: 'hobbies',
        attributes: { exclude: ['created_at', 'updated_at'] },
      },
    ],
  });
  // Check if my profile is not pending or banned
  if (!me || me.status === 'pending' || me.status === 'banned') {
    return res.status(401).json({ blocked: true });
  }

  const meToSend = {
    ...me.toJSON(),
    age: computeAge(me.birth_date),
  };

  // Send my data
  res.status(200).json(meToSend);
}

//Mettre à jour un utilisateur
export async function updateUserProfile(req, res) {
  console.log('UPDATE REQUEST', req.body);
  // Get my Id
  const myId = parseInt(req.user.userId, 10);

  // Joi schema for input validation
  const updateUserSchema = Joi.object({
    name: Joi.string().max(50),
    description: Joi.string(),
    picture: Joi.string(),
    picture_id: Joi.string(),
    email: Joi.string().max(255).email({ minDomainSegments: 2 }),
    new_password: Joi.string()
      .min(12)
      .max(36)
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,36}$/)
      .messages({
        'string.base': 'password must be a string',
        'string.min': 'password must be at least 12 characters',
        'string.max': 'password must be less than 36 characters',
        'string.empty': 'password should not be empty',
        'string.pattern.base':
          'password should contain at least one uppercase letter, one lowercase letter, one digit and one special character',
      }),
    repeat_new_password: Joi.string()
      .valid(Joi.ref('new_password'))
      .when('new_password', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    old_password: Joi.string().when('new_password', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    hobbies: Joi.array().items(Joi.number().integer().min(1)).min(1),
  }).min(1);

  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }

  const foundUser = await User.findByPk(myId, {
    include: [
      {
        model: Hobby,
        as: 'hobbies',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (
    !foundUser ||
    foundUser.status === 'pending' ||
    foundUser.status === 'banned'
  ) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { new_password, old_password } = req.body;
  let hashedNewPassword = null;

  if (new_password) {
    const isOldPasswordValid = await Scrypt.compare(
      old_password,
      foundUser.password
    );

    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    hashedNewPassword = await Scrypt.hash(new_password);
  }

  const editedProfile = {
    name: req.body.name || foundUser.name,
    description: req.body.description || foundUser.description,
    picture: req.body.picture || foundUser.picture,
    picture_id: req.body.picture_id || foundUser.picture_id,
    email: req.body.email || foundUser.email,
    password: hashedNewPassword || foundUser.password,
  };

  await foundUser.update(editedProfile);

  if (req.body.hobbies) {
    await foundUser.setHobbies(req.body.hobbies);
  }

  const updatedUser = await User.findByPk(myId, {
    attributes: [
      'id',
      'name',
      'birth_date',
      'description',
      'gender',
      'picture',
      'email',
      'status',
    ],
    include: [
      {
        model: Hobby,
        as: 'hobbies',
        attributes: ['id', 'name'],
      },
      {
        association: 'events',
        attributes: ['id', 'name', 'location', 'picture', 'date', 'time'],
      },
    ],
  });

  return res.status(200).json({
    ...updatedUser.toJSON(),
    age: computeAge(updatedUser.birth_date),
  });
}

//Supprimer un utilisateur
export async function deleteUser(req, res) {
  const userIdToDelete = parseInt(req.user.userId, 10);

  const deleteUserSchema = Joi.object({
    password: Joi.string().required(),
  });

  const { error } = deleteUserSchema.validate(req.body);
  if (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }

  const userToDelete = await User.findByPk(userIdToDelete);

  const { password } = req.body;
  const isPasswordValid = await Scrypt.compare(password, userToDelete.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  if (userToDelete.picture_id) {
    await cloudinary.uploader.destroy(userToDelete.picture_id);
  }

  await userToDelete.destroy();

  res.status(204).end();
}

//Récupérer tous les utilisateurs qui ont les mêmes centres d'intérets
export async function getAllSameInterestUsers(req, res) {
  // Get my id, and check if it's a number
  const myId = parseInt(req.user.userId);

  if (isNaN(myId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

  // get my hobbies
  const myHobbies = await User_hobby.findAll({ where: { user_id: myId } });

  // Create an array in which to store my hobbies ids
  const myHobbiesArrayId = [];
  myHobbies.forEach((hobby) => {
    myHobbiesArrayId.push(hobby.hobby_id);
  });

  // find all users that share at least one of my hobbies, in random order, except me
  const mySuggestions = await User.findAll({
    attributes: ['id', 'name', 'gender', 'birth_date', 'picture'],
    include: {
      association: 'hobbies',
      attributes: [],
      where: { id: myHobbiesArrayId },
    },

    where: {
      id: { [Op.not]: myId },
      status: 'active',
    },
  });

  // Prepare an object to be sent
  const mySuggestionsToSend = [];

  mySuggestions.forEach((user) => {
    const userObject = {
      id: user.id,
      name: user.name,
      gender: user.gender,
      birth_date: user.birth_date,
      age: computeAge(user.birth_date),
      picture: user.picture,
    };
    mySuggestionsToSend.push(userObject);
  });

  res.status(200).json(mySuggestionsToSend);
}

//Enregistré un utilisateur connecté, à un évenement spécifique
export async function addUserToEvent(req, res) {
  const eventId = parseInt(req.params.eventId, 10);
  const userId = parseInt(req.user.userId, 10);

  if (!(await isActiveUser(userId))) {
    return res.status(403).json({ blocked: true });
  }

  const event = await Event.findByPk(eventId);
  if (!event) {
    return res.status(404).json({ message: 'event not found' });
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: 'user not found' });
  }
  await user.addEvent(event);
  res.status(204).end();
}

//Supprimer un utilisateur connecté, d'un évenement spécifique
export async function deleteUserToEvent(req, res) {
  const eventId = parseInt(req.params.eventId, 10);
  const userId = parseInt(req.user.userId, 10);

  const event = await Event.findByPk(eventId);
  if (!event) {
    return res.status(404).json({ message: 'event not found' });
  }

  const user = await User.findByPk(userId);
  if (!user || user.status === 'pending' || user.status === 'banned') {
    return res.status(403).json({ blocked: true });
  }

  await user.removeEvent(event);
  res.status(204).end();
}

// Upload user photo function
export async function uploadUserPhoto(req, res) {
  console.log('UPLOAD REQUEST');
  const userId = parseInt(req.user.userId, 10);

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    // The uploaded file is available in req.file
    const { path, filename } = req.file;
    console.log(req.file);

    // Retrieve user to get the old picture ID
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If there is an existing picture, remove it from Cloudinary
    if (user.picture_id) {
      try {
        await cloudinary.uploader.destroy(user.picture_id);
      } catch (err) {
        console.error(
          'Error deleting old picture from Cloudinary:',
          err.message
        );
        // Proceed to update user even if old picture delete fails
      }
    }

    // Return success response
    res.status(200).json({
      picture: path,
      picture_id: filename,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Failed to upload photo', error: error.message });
  }
}
