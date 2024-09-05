import { User_message, User } from '../models/index.js';
import Joi from 'joi';
import { Op } from 'sequelize';

// Récupere tous les messages d'un utilisateur connecté
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

// Récupere tous les utilisateurs avec qui j'ai une conversation et les messages correspondant
export async function getAllUserContacts(req, res) {
  // Get my id and check if i'm active
  const myId = parseInt(req.user.userId, 10);
  const me = await User.findByPk(myId);
  if (!me || me.status === 'pending' || me.status === 'banned') {
    return res.status(401).json({ blocked: true });
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