import {
  User,
  Hobby,
  Event,
  User_message,
  User_hobby,
} from '../models/index.js';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import { computeAge } from '../utils/computeAge.js';

//Récupérer tous les utilisateurs TODO FAIRE LA ROUTE
export async function getAllUsers(req, res) {
  const allUsers = await User.findAll();
  //TODO : gestion du 403 unauthorized (token)

  res.status(200).json(allUsers);
}

//Récupérer un utilisateur TODO FAIRE ROUTE
export async function getOneUser(req, res) {
  // Get the userId in params, and check if it's a number
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

  // Get my id and check if i'm active
  const myId = parseInt(req.user.userId, 10);
  const me = await User.findByPk(myId);
  if (!me || me.status === 'pending' || me.status === 'banned') {
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

//Récuperer l'utilisateur connecté
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
export async function updateUser(req, res) {}

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
    attributes: ['id', 'name', 'birth_date', 'picture'],
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

  const me = await User.findByPk(userId);
  if (!me || me.status === 'banned' || me.status === 'pending') {
    res.status(401).json({ blocked: true });
    // il faut ensuite que le front déclenche la suppression du token a la
    //reception de cette valeur 'block : true'
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
  if (!user) {
    return res.status(404).json({ message: 'user not found' });
  }
  await user.removeEvent(event);
  res.status(204).end();
}

//Récupérer tous les évenements auquels s'est inscrit un utilisateur
export async function getAllEventsUser(req, res) {}
