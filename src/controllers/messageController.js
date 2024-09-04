import { User_message, User } from '../models/index.js';
import Joi from 'joi';

//Envoyer une message a un utilisateur spécifique
export async function sendMessageToUser(req, res) {
  // Get my id and check if it's a number
  const myId = parseInt(req.user.userId, 10);
  if (isNaN(myId)) {
    return res.status(400).json({ message: 'this id is not valid' });
  }

  // Check if I exist and if I am not banned or pending
  const me = await User.findByPk(myId);

  if (!me || me.status === 'pending' || me.status === 'banned') {
    return res.status(401).json({ blocked: true });
  }

  // Convert string in number before Joi check
  req.body.receiver_id = parseInt(req.body.receiver_id, 10);

  // Build a Joi schema to check data in body
  const messageSchema = Joi.object({
    message: Joi.string().required(),
    receiver_id: Joi.number().integer().min(1),
  });

  const { error } = messageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // Once body is ok, use it to create new message
  const { message, receiver_id } = req.body;

  console.log(receiver_id);

  const messageSent = await User_message.create({
    message,
    sender_id: myId,
    receiver_id,
  });

  res.status(201).json(messageSent);
}
