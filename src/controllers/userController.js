import { User, Hobby, Event, User_message } from '../models/index.js';
import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';
import { Scrypt } from '../auth/Scrypt.js';
import {computeAge} from '../utils/computeAge.js';
import { Op, Sequelize } from 'sequelize';

//Récupérer tous les utilisateurs
export async function getAllUsers(req, res) {
 
    const excludedUserId = req.user.userId;
    //const excludedStatuses = ['pending', 'banned'];
    
    const allUsers = await User.findAll({
        where: {
           status:"active",  
            id : {[Op.not]:excludedUserId}
                },
        attributes: ['id', 'name', 'birth_date', 'picture'],  
          
      });
       
    // Map over the users and add the computed age
    const usersWithAge = allUsers.map(user => ({
        // Convert Sequelize model instance to a plain object
        ...user.toJSON(),  
        // Add computed age
        age: computeAge(user.birth_date)  
    }));
  
    res.status(200).json(usersWithAge);
}


//Récupérer un utilisateur
export async function getOneUser(req, res) {
  //verif de l'id
  const id = req.params.id;
  if (isNaN(id)) {
    res.status(400).json({ message: 'this id is not valid' });
  }

  
  const oneUser = await User.findByPk(id);
  if (!oneUser) {
    res.status(404).json({ message: 'user not found' });
  }
  res.status(200).json(oneUser);
}

//Récupérer l'utilisateur connecté
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

//Mise à jour du profil de l'utilisateur connecté

export async function updateUserProfile(req, res) {
  const myId = parseInt(req.user.userId, 10);
  const updateUserSchema = Joi.object({
    name: Joi.string().max(50),
    birth_date: Joi.date().less(new Date(new Date().setFullYear(new Date().getFullYear() - 60))).optional(),
    description: Joi.string().optional(),
    gender: Joi.string().max(10).valid('male', 'female', 'other').optional(),
    picture: Joi.string().max(255),
    email: Joi.string()
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
      .optional(),
    password: Joi.string().min(12).max(255).optional(),
    repeat_password: Joi.string().valid(Joi.ref('password')).optional(),
    old_password: Joi.string().when('password', { is: Joi.exist(), then: Joi.required() }),
    hobbies: Joi.array().items(Joi.number().integer().min(1)).optional()
  });

  // Validate request body using Joi
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ messages: errorMessages });
  }

  const foundUser = await User.findByPk(myId, {
    include: [{ 
      model: Hobby, 
      as: 'hobbies',
      attributes: ['id', 'name'] 
    }]
  });

  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }

  if (foundUser.status === 'pending' || foundUser.status === 'banned') {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, birth_date, description, gender, picture, password, old_password, hobbies, repeat_password } = req.body;

  // Create an object to update the user's profile
  const newProfile = {
    name: name || foundUser.name,
    birth_date: birth_date || foundUser.birth_date,
    description: description || foundUser.description,
    gender: gender || foundUser.gender,
    picture: picture || foundUser.picture,
    email: req.body.email || foundUser.email
  };

  // Update if a new password is provided
  if (password) {
    if (!old_password) {
      return res.status(400).json({ message: "Old password is required to change the password." });
    }
  //Verify if the old password is correct
    const isOldPasswordValid = await Scrypt.compare(old_password, foundUser.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (password !== repeat_password) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const hashedNewPassword = await Scrypt.hash(password);
    newProfile.password = hashedNewPassword;
  }

  // Update the user's profile information in the database
  await foundUser.update(newProfile);

  // Update hobbies if provided
  if (Array.isArray(hobbies)) {
    const updatedHobbies = await Hobby.findAll({
      where: { id: hobbies },
      attributes: ['id', 'name']
    });

    //Check if any hobbies were found
    if (!updatedHobbies.length) {
      return res.status(404).json({ message: "Hobbies not found" });
    }

    // Update user's hobbies
    await foundUser.setHobbies(updatedHobbies);
  }

  // Reload the user to include the updated hobbies
  const updatedUser = await User.findByPk(myId, {
    include: [{ 
      model: Hobby, 
      as: 'hobbies',
      attributes: ['id', 'name']
    }]
  });

  // Return the updated user profile as a response
  res.status(200).json({
    id: updatedUser.id,
    name: updatedUser.name,
    birth_date: updatedUser.birth_date,
    age: computeAge(updatedUser.birth_date),
    description: updatedUser.description,
    gender: updatedUser.gender,
    picture: updatedUser.picture,
    email: updatedUser.email,
    hobbies: updatedUser.hobbies
  });
}


//Supprimer un utilisateur
export async function deleteUser(req, res) {}

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
