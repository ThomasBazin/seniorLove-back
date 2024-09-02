import { User, Hobby, Event, User_message } from '../models/associations.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';

//données de test
const body = {
  name: 'SeniorLove10',
  birth_date: '1960-05-15',
  description: 'je suis une personne douce et attentionnée',
  gender: 'female',
  picture:
    'https://st4.depositphotos.com/22611548/38059/i/1600/depositphotos_380591824-stock-photo-portrait-happy-mature-woman-eyeglasses.jpg',
  email: 'rdddee5@example.com',
  password: 'jacqueline1950!',
  repeat_password: 'jacqueline1950!',
};

//joi schema configuration
//TODO 
const schema = Joi.object({
  name: Joi.string().max(50).required(),
  birth_date: Joi.date().required(),
  description: Joi.string(),
  gender: Joi.string().max(10).valid('male', 'female', 'other').required(),
  picture: Joi.string().max(255),
  email: Joi.string()
    .max(255)
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
    .required(),
  password: Joi.string().min(12).max(255).required(),
  repeat_password: Joi.ref('password'),
});

//Ajouter un utilisateur
export async function addUser(req, res) {
  //const body = req.body;
  if (!body) {
    res.status(400).json({ message: 'bad request' });
  }

  const { value } = schema.validate(body);
  if (!value) {
    return res.status(400).json({ message: 'bad request' });
  }

  const { repeat_password } = body;
  const createUser = await User.create({
    name: body.name,
    birth_date: body.birth_date,
    description: body.description,
    gender: body.gender,
    picture: body.picture,
    email: body.email,
    password: Scrypt.hash(repeat_password),
  });
  //res.status(200);

  const hobbie = [1, 2, 3];

  const userHobies = await Hobby.findAll({
    where: { id: hobbie },
  });

  await createUser.addHobbies(userHobies);
}

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
