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
  const myId = parseInt(req.user.userId, 10);

  const hobbySchema = Joi.object({
    id: Joi.number().integer().min(1).optional(),
    name: Joi.string().optional(),
    users_hobbies: Joi.any().optional(),
  });

  const hobbiesArraySchema = Joi.array().items(hobbySchema).optional();

  const updateUserSchema = Joi.object({
    name: Joi.string().max(50).optional(),
    birth_date: Joi.date()
      .less(new Date(new Date().setFullYear(new Date().getFullYear() - 60)))
      .optional(),
    description: Joi.string().optional(),
    gender: Joi.string().max(10).valid('male', 'female', 'other').optional(),
    picture: Joi.string().max(255).optional(),
    picture_id: Joi.string().max(255).optional(),
    email: Joi.string().max(255).email({ minDomainSegments: 2 }).optional(),
    new_password: Joi.string().min(12).max(255).optional(),
    repeat_new_password: Joi.string().valid(Joi.ref('new_password')).optional(),
    old_password: Joi.string()
      .when('new_password', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .optional(),
    hobbies: hobbiesArraySchema.optional(),
  }).min(1);

  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    console.log('Validation error:', errorMessages);
    return res.status(400).json({ messages: errorMessages });
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

  if (!foundUser) {
    console.log('User not found');
    return res.status(404).json({ message: 'User not found' });
  }

  if (foundUser.status === 'pending' || foundUser.status === 'banned') {
    console.log('User is unauthorized due to status:', foundUser.status);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const {
    name,
    birth_date,
    description,
    gender,
    picture,
    picture_id,
    new_password,
    old_password,
    hobbies,
    repeat_new_password,
    email,
  } = req.body;

  const newProfile = {
    name: name || foundUser.name,
    birth_date: birth_date || foundUser.birth_date,
    description: description || foundUser.description,
    gender: gender || foundUser.gender,
    picture: picture || foundUser.picture,
    picture_id: picture_id || foundUser.picture_id,
    email: email || foundUser.email,
  };

  if (new_password) {
    if (!old_password) {
      return res
        .status(400)
        .json({ message: 'Old password is required to change the password.' });
    }

    const isOldPasswordValid = await Scrypt.compare(
      old_password,
      foundUser.password
    );
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    if (new_password !== repeat_new_password) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const hashedNewPassword = await Scrypt.hash(new_password);
    newProfile.password = hashedNewPassword;
  }

  await foundUser.update(newProfile);

  await User_hobby.destroy({
    where: {
      user_id: foundUser.id,
    },
  });

  if (Array.isArray(hobbies) && hobbies.length > 0) {
    const hobbiesArray = hobbies.map((hobby) => ({
      user_id: foundUser.id,
      hobby_id: hobby.id,
    }));

    await User_hobby.bulkCreate(hobbiesArray);
  }

  const updatedUser = await User.findByPk(myId, {
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
    id: updatedUser.id,
    name: updatedUser.name,
    birth_date: updatedUser.birth_date,
    description: updatedUser.description,
    gender: updatedUser.gender,
    picture: updatedUser.picture,
    email: updatedUser.email,
    hobbies: updatedUser.hobbies,
    age: computeAge(updatedUser.birth_date),
    events: updatedUser.events,
  });
}

//Supprimer un utilisateur
export async function deleteUser(req, res) {
  const userIdToDelete = parseInt(req.user.userId, 10);

  await User.destroy({
    where: { id: userIdToDelete },
  });

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
export const uploadUserPhoto = [
  async (req, res) => {
    const userId = parseInt(req.user.userId, 10);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
      // The uploaded file is available in req.file
      const { path: filePath, filename } = req.file;

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

      // Update user's picture URL and picture ID
      user.picture = filePath;
      user.picture_id = filename;

      await user.save();

      // Return success response
      res.status(200).json({
        message: 'Photo updated successfully',
        pictureUrl: req.file.path,
        pictureId: req.file.filename,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Failed to upload photo', error: error.message });
    }
  },
];
