import {
  User,
  Hobby,
  Event,
  User_message,
  User_hobby,
} from '../models/index.js';
import Joi from 'joi';
import { isActiveUser } from '../utils/checkUserStatus.js';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import { computeAge } from '../utils/computeAge.js';
import jsonwebtoken from 'jsonwebtoken';
import { Scrypt } from '../auth/Scrypt.js';

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

  // Prepare an object to be sent, adding age field (computed)
  const {
    id,
    name,
    birth_date,
    description,
    gender,
    picture,
    email,
    events,
    hobbies,
  } = me;

  const meToSend = {
    id,
    name,
    birth_date,
    age: computeAge(birth_date),
    description,
    gender,
    picture,
    email,
    events,
    hobbies,
  };

  // Send my data
  res.status(200).json(meToSend);
}

//Mettre à jour un utilisateur
export async function updateUserProfile(req, res) {
  const myId = parseInt(req.user.userId, 10);

  const updateUserSchema = Joi.object({
    name: Joi.string().max(50),
    birth_date: Joi.date()
      .less(new Date(new Date().setFullYear(new Date().getFullYear() - 60)))
      .optional(),
    description: Joi.string().optional(),
    gender: Joi.string().max(10).valid('male', 'female', 'other').optional(),
    picture: Joi.string().max(255),
    email: Joi.string()
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
      .optional(),
    new_password: Joi.string().min(12).max(255).optional(),
    repeat_new_password: Joi.string().valid(Joi.ref('new_password')).optional(),
    old_password: Joi.string().when('new_password', {
      is: Joi.exist(),
      then: Joi.required(),
    }),
    hobbies: Joi.array().items(Joi.number().integer().min(1)).optional(),
  }).min(1);

  // Validate request body using Joi
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
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
    return res.status(404).json({ message: 'User not found' });
  }

  if (foundUser.status === 'pending' || foundUser.status === 'banned') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const {
    name,
    birth_date,
    description,
    gender,
    picture,
    new_password,
    old_password,
    hobbies,
    repeat_new_password,
  } = req.body;

  // Create an object to update the user's profile
  const newProfile = {
    name: name || foundUser.name,
    birth_date: birth_date || foundUser.birth_date,
    description: description || foundUser.description,
    gender: gender || foundUser.gender,
    picture: picture || foundUser.picture,
    email: req.body.email || foundUser.email,
  };

  // Update if a new password is provided
  if (new_password) {
    if (!old_password) {
      return res
        .status(400)
        .json({ message: 'Old password is required to change the password.' });
    }
    //Verify if the old password is correct
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

  // Update the user's profile information in the database
  await foundUser.update(newProfile);

  // Update hobbies if provided
  if (Array.isArray(hobbies)) {
    const updatedHobbies = await Hobby.findAll({
      where: { id: hobbies },
      attributes: ['id', 'name'],
    });

    //Check if any hobbies were found
    if (!updatedHobbies.length) {
      return res.status(404).json({ message: 'Hobbies not found' });
    }

    // Update user's hobbies
    await foundUser.setHobbies(updatedHobbies);
  }

  // Reload the user to include the updated hobbies
  const updatedUser = await User.findByPk(myId, {
    include: [
      {
        model: Hobby,
        as: 'hobbies',
        attributes: ['id', 'name'],
      },
    ],
  });

  // Return the updated user profile as a response
  return res.status(200).json({
    id: updatedUser.id,
    name: updatedUser.name,
    birth_date: updatedUser.birth_date,
    description: updatedUser.description,
    gender: updatedUser.gender,
    picture: updatedUser.picture,
    email: updatedUser.email,
    hobbies: updatedUser.hobbies,
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
    order: sequelize.random(),
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
    res.status(403).json({ blocked: true });
  }
  /*const me = await User.findByPk(userId);
  if (!me || me.status === 'banned' || me.status === 'pending') {
    res.status(403).json({ blocked: true });
    // il faut ensuite que le front déclenche la suppression du token a la
    //reception de cette valeur 'block : true'
  }*/

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
    return res.status(401).json({ blocked: true });
  }

  await user.removeEvent(event);
  res.status(204).end();
}

//Récupérer tous les évenements auquels s'est inscrit un utilisateur
export async function getAllEventsUser(req, res) {}
