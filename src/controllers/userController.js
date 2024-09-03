import { User, Hobby, Event, User_message, User_hobby } from '../models/index.js';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken'

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
export async function getConnectedUser(req, res) {
  const myId = parseInt(req.user.userId);
  console.log(myId)

  const foundUser = await User.findByPk(myId, {include:[{ model: Hobby, as: 'hobbies' }]})
  if (foundUser.status === 'pending' || foundUser.status === 'banned') {
    return res.status(401).json({message: "Unauthorized"});
  }

  const { id, name, birth_date, description, gender, picture, email, hobbies} = foundUser;
 const me = {
  id,
  name,
  birth_date,
  description,
  gender,
  picture,
  email,
  hobbies
 }

  res.status(200).json(me);
}

//Mettre à jour un utilisateur
export async function updateUser(req, res) {


}

//Supprimer un utilisateur
export async function deleteUser(req, res) {}

//Récupérer tous les utilisateurs qui ont les mêmes centres d'intérets
export async function getAllSameInterestUsers(req, res) {
  const myId = req.user.userId;
  // console.log(myId)

  // get my hobbies
  const myHobbies = await User_hobby.findAll({where: {user_id: myId}})
  // console.log(JSON.stringify(myHobbies, null, 2))
  let myHobbiesArrayId = []
  myHobbies.forEach(hobby => {
    myHobbiesArrayId.push(hobby.hobby_id)
  })


  // find all users that havec my hobbies, except me
  const mySuggestions = await User.findAll({include: {
    association: "hobbies",
    where: {id: myHobbiesArrayId}
  },
where: {
  id: !myId
}})
  console.log(JSON.stringify(mySuggestions, null, 2))

  res.status(200).json(mySuggestions);
}

//Enregistré un utilisateur connecté, à un évenement spécifique
export async function addUserToEvent(req, res) {}

//Supprimer un utilisateur connecté, d'un évenement spécifique
export async function deleteUserToEvent(req, res) {}

//Récupérer tous les évenements auquels s'est inscrit un utilisateur
export async function getAllEventsUser(req, res) {}

//Récupere tous les messages d'un utilisateur connecté
export async function getAllUserMessages(req, res) {}
