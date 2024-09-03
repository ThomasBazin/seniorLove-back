import { User, Hobby, Event, User_message } from '../models/associations.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken'

const jwtSecret = 'Sen1@rL0ve';
// Création du token

//données de test
/*const body = {
  name: 'SeniorLove10',
  birth_date: '1960-05-15',
  description: 'je suis une personne douce et attentionnée',
  gender: 'female',
  picture:
    'https://st4.depositphotos.com/22611548/38059/i/1600/depositphotos_380591824-stock-photo-portrait-happy-mature-woman-eyeglasses.jpg',
  email: 'rdddee5@example.com',
  password: 'jacqueline1950!',
  repeat_password: 'jacqueline1950!',
};*/



//Ajouter un utilisateur
export async function addUser(req, res) {
  const body = req.body;
  if (!body) {
    return res.status(400).json({ message: 'body required' });
  }

    //joi schema configuration
  //TODO : gestion de l'age de l'utilisateur >= 60 ans
  const registerSchema = Joi.object({
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
    hobbies: Joi.array().items(Joi.number().integer().min(1))
  });

  const { error, value } = registerSchema.validate(body);
  if (!value) {
    return res.status(400).json({ message: error.message });
  }

  const { repeat_password } = req.body;
  
    const createUser = await User.create({
      name: body.name,
      birth_date: body.birth_date,
      description: body.description,
      gender: body.gender,
      picture: body.picture,
      email: body.email,
      password: Scrypt.hash(repeat_password),
    });

    // récupération de l'id des intérêts
   const hobbies = req.body.hobbies
    console.log(hobbies)
  
    const userHobies = await Hobby.findAll({
    where: { id: hobbies },
  });
  
    await createUser.addHobbies(userHobies);
 
    res.status(201).json({message : "ok"})

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
export async function loginUser(req, res) {
  const loginSchema = Joi.object({
    email: Joi.string()
    .max(255)
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
    .required(),
  password: Joi.required(),
  })
  const {email, password} = req.body;

  const { error, value} = loginSchema.validate(req.body)
 
  if(error) {
    return res.status(403).json({message : error.message })
  }
 
  const foundUser = await User.findOne({
  where : { email : email }
})

if (!foundUser) {
  return res.status(401).json({message : 'user unauthorized'})
}

const isGood = Scrypt.compare(password, foundUser.password)

if (!isGood) {
  return res.status(401).json({message : 'user unauthorized'})
}

const jwtContent = {userId: foundUser.id};

const token = jsonwebtoken.sign(jwtContent, jwtSecret, { expiresIn: '3h', algorithm: 'HS256' });

res.status(200).json({logged: true, token})


}

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
