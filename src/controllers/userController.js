import { User, Hobby, Event, User_message } from '../models/index.js';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';

//Récupérer tous les utilisateurs TODO FAIRE LA ROUTE
export async function getAllUsers(req, res) {
  const allUsers = await User.findAll();
  //TODO : gestion du 403 unauthorized (token)

  res.status(200).json(allUsers);
}

//Récupérer un utilisateur TODO FAIRE ROUTE
export async function getOneUser(req, res) {
  //verif de l'id
  const id = req.params.id;
  if (id === isNaN(id)) {
    res.status(400).json({ message: 'this id is not valid' });
  }

  //TODO : gestion du 403 unauthorized (token)

  const oneUser = await User.findByPk(id);
  if (!oneUser) {
    res.status(404).json({ message: 'user not found' });
  }
  res.status(200).json(oneUser);
}

//Récuperer l'utilisateur connecté
export async function getConnectedUser(req, res) {
  const myId = parseInt(req.user.userId);
  console.log(myId);

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
  if (me.status === 'pending' || me.status === 'banned') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.status(200).json(me);
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
export async function getAllSameInterestUsers(req, res) {}

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

//Récupere tous les messages d'un utilisateur connecté
export async function getAllUserMessages(req, res) {}
