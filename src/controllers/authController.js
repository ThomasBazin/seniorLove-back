import { User, Hobby, Event } from '../models/index.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';

import { jwtSecret } from '../../index.js';

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
    hobbies: Joi.array().items(Joi.number().integer().min(1)),
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
  const hobbies = req.body.hobbies;
  console.log(hobbies);

  const userHobies = await Hobby.findAll({
    where: { id: hobbies },
  });

  await createUser.addHobbies(userHobies);

  res.status(201).json({ message: 'ok' });
}

//Connecter un utilisateur
export async function loginUser(req, res) {
  const loginSchema = Joi.object({
    email: Joi.string()
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
      .required(),
    password: Joi.required(),
  });
  const { email, password } = req.body;

  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    return res.status(403).json({ message: error.message });
  }

  const foundUser = await User.findOne({
    where: { email: email },
  });

  if (
    !foundUser ||
    foundUser.status == 'banned' ||
    foundUser.status === 'pending'
  ) {
    return res.status(401).json({ message: 'user unauthorized' });
  }

  const isGood = Scrypt.compare(password, foundUser.password);

  if (!isGood) {
    return res.status(401).json({ message: 'user unauthorized' });
  }

  const jwtContent = { userId: foundUser.id };

  const token = jsonwebtoken.sign(jwtContent, jwtSecret, {
    expiresIn: '3h',
    algorithm: 'HS256',
  });

  res.status(200).json({ logged: true, token });
}
