import 'dotenv/config';
import { User, Hobby } from '../models/index.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';
import computeAge from '../utils/computeAge.js';

// /Ajouter un utilisateur
export async function addUser(req, res) {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ message: 'body required' });
  }

  // Joi schema configuration (no picture in schema)
  const registerSchema = Joi.object({
    name: Joi.string().max(50).required(),
    birth_date: Joi.date().required(),
    description: Joi.string(),
    gender: Joi.string().max(10).valid('male', 'female', 'other').required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(12).max(255).required(),
    repeat_password: Joi.valid(Joi.ref('password')).required(),
    hobbies: Joi.array().items(Joi.number().integer().min(1)).required(),
  });

  const { error } = registerSchema.validate(body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // Age control using custom function
  if (computeAge(req.body.birth_date) < 60) {
    return res.status(400).json({ message: 'must be over 60 to register' });
  }

  const { repeat_password, email } = req.body;

  // Check if email already exists
  const potentialExistingUser = await User.findOne({ where: { email: email } });
  if (potentialExistingUser) {
    return res.status(400).json({ message: 'e-mail already registered' });
  }

  // Handle file upload (optional picture)
  let picture = null;
  let picture_id = null;
  if (req.file) {
    picture = req.file.path;
    picture_id = req.file.filename;
  }

  const createUser = await User.create({
    name: body.name,
    birth_date: body.birth_date,
    description: body.description,
    picture, // Only include if picture exists
    picture_id, // Only include if picture_id exists
    gender: body.gender,
    email: body.email,
    password: Scrypt.hash(repeat_password),
  });

  // Fetch hobbies from the database and associate with the user
  const hobbies = req.body.hobbies;

  const userHobbies = await Hobby.findAll({
    where: { id: hobbies },
  });

  await createUser.addHobbies(userHobbies);

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

  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  const foundUser = await User.findOne({
    where: { email: email },
  });

  if (
    !foundUser ||
    foundUser.status === 'banned' ||
    foundUser.status === 'pending'
  ) {
    return res.status(401).json({ blocked: true });
  }

  const isGood = Scrypt.compare(password, foundUser.password);

  if (!isGood) {
    return res.status(401).json({ message: 'user unauthorized' });
  }

  const jwtContent = { userId: foundUser.id };

  const token = jsonwebtoken.sign(jwtContent, process.env.TOKEN_KEY, {
    expiresIn: '3h',
    algorithm: 'HS256',
  });

  res.status(200).json({
    id: foundUser.id,
    name: foundUser.name,
    picture: foundUser.picture,
    token,
  });
}
