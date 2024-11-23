import 'dotenv/config';
import { User } from '../models/index.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';

//Connecter un utilisateur
export async function loginUser(req, res) {
  const loginSchema = Joi.object({
    email: Joi.string().max(255).email({ minDomainSegments: 2 }).required(),
    password: Joi.required(),
  });
  const { email, password } = req.body;

  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const foundUser = await User.findOne({
    where: { email: email },
  });

  if (
    !foundUser ||
    foundUser.status === 'banned' ||
    foundUser.status === 'pending'
  ) {
    return res.status(401).json({ message: 'user unauthorized' });
  }

  const checkIfPasswordMatches = Scrypt.compare(password, foundUser.password);

  if (!checkIfPasswordMatches) {
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
