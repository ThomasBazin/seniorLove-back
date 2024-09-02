import { User, Hobby, Event, User_message } from '../models/associations.js';
import { Scrypt } from '../src/auth/Scrypt.js';
import Joi from 'joi';

const schema = Joi.object({
  name: Joi.string().alphanum().max(50).required(),
  birth_date: Joi.date().less('now').greater('now - 60 years').iso().required(),
  description: Joi.string().alphanum(),
  gender: Joi.string().max(10).valid('male', 'female', 'other').required(),
  picture: Joi.string().max(255),
  email: Joi.string()
    .alphanum()
    .max(255)
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
    .required(),
  password: Joi.string().min(12).max(255).required(),
  repeat_password: Joi.ref('password'),
});

//Ajouter un utilisateur
export async function addUser(req, res) {}

//Récupérer tous les utilisateurs
export async function getAllUsers(req, res) {
  const allUsers = await User.findAll();
  //TODO : gestion du 403 unauthorized (token)

  res.status(200).json(allUsers);
}

//Récupérer un utilisateur
export async function getOneUser(req, res) {
  //verif de l'id
  const id = req.params.id;
  if (id === isNaN) {
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
export async function getConnectedUser(req, res) {}

//Mettre à jour un utilisateur
export async function updateUser(req, res) {}

//Supprimer un utilisateur
export async function deleteUser(req, res) {}

//Connecter un utilisateur
export async function loginUser(req, res) {}

//Déconnecter un utilisateur
export async function logoutUser(req, res) {}

//Récupérer tous les utilisateurs qui ont les mêmes centres d'intérets
export async function getAllSameInterestUsers(req, res) {}

//Enregistré un utilisateur connecté, à un évenement spécifique
export async function addUserToEvent(req, res) {}

//Supprimer un utilisateur connecté, d'un évenement spécifique
export async function deleteUserToEvent(req, res) {}

//Récupérer tous les évenements auquels s'est inscrit un utilisateur
export async function getAllEventsUser(req, res) {}

//Récupere tous les messages d'un utilisateur connecté
export async function getAllUserMessages(req, res) {}
