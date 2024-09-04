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

//Récupérer tous les utilisateurs
export async function getAllUsers(req, res) {
  const allUsers = await User.findAll();
  //TODO : gestion du 403 unauthorized (token)

  res.status(200).json(allUsers);
}

//Récupérer un utilisateur
export async function getOneUser(req, res) {
  // Get the userId in params, and check if it's a number
  const userId = parseInt(req.params.userId, 10);
  console.log(userId);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'this id is not valid' });
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
  // Get my id and check if it's a number
  const myId = parseInt(req.user.userId, 10);
  if (isNaN(myId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

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
  if (me.status === 'pending' || me.status === 'banned') {
    return res.status(401).json({ blocked: true });
  }
  // Send my data
  res.status(200).json(me);
}

//Mettre à jour un utilisateur
export async function updateUser(req, res) {}

//Supprimer un utilisateur
export async function deleteUser(req, res) {}

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

  res.status(200).json(mySuggestions);
}

//Enregistré un utilisateur connecté, à un évenement spécifique
export async function addUserToEvent(req, res) {}

//Supprimer un utilisateur connecté, d'un évenement spécifique
export async function deleteUserToEvent(req, res) {}

//Récupérer tous les évenements auquels s'est inscrit un utilisateur
export async function getAllEventsUser(req, res) {}

//Récupere tous les messages d'un utilisateur connecté
export async function getAllUserMessages(req, res) {
  // Get my id, and check if it's a number
  const myId = parseInt(req.user.userId, 10);
  if (isNaN(myId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

  // Get in DB all messages that have my id as sender OR receiver
  const myMessages = await User_message.findAll({
    where: { [Op.or]: [{ sender_id: myId }, { receiver_id: myId }] },
    attributes: { exclude: 'updated_at' },
    include: [
      { association: 'sender', attributes: ['id', 'name', 'picture'] },
      { association: 'receiver', attributes: ['id', 'name', 'picture'] },
    ],
  });

  // Send data. If none, an empty array will be sent
  res.status(200).json(myMessages);
}

export async function getAllUserContacts(req, res) {
  // Get my id and check if it's a number
  const myId = parseInt(req.user.userId, 10);
  if (isNaN(myId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

  // Get in DB all users that have received messages sent by me, or that have sent messages received by me
  const myContacts = await User.findAll({
    include: [
      {
        model: User_message,
        as: 'received_messages',
        order: [['created_at', 'DESC']],
        where: { sender_id: myId },
        attributes: { exclude: ['updated_at'] },
        include: {
          association: 'sender',
          attributes: ['id', 'name', 'picture'],
        },
      },
      {
        model: User_message,
        as: 'sent_messages',
        order: [['created_at', 'DESC']],
        where: { receiver_id: myId },
        attributes: { exclude: ['updated_at'] },
        include: {
          association: 'sender',
          attributes: ['id', 'name', 'picture'],
        },
      },
    ],
    attributes: ['id', 'name', 'picture'],
  });
  // Send the result as is, if it's an empty array (no match)
  if (!myContacts.length) {
    return res.status(200).json(myContacts);
  }

  // Else prepare a new array with an object template with necessary data to be sent, and sort messages by created_at

  const formattedContacts = [];

  myContacts.forEach((converser) => {
    const converserObject = {
      id: converser.id,
      name: converser.name,
      picture: converser.picture,
      messages: [
        ...converser.received_messages,
        ...converser.sent_messages,
      ].sort((a, b) => a.created_at - b.created_at),
    };
    formattedContacts.push(converserObject);
  });

  res.status(200).json(formattedContacts);
}
