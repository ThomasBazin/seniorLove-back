import { Admin, User, Hobby, Event } from '../models/index.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import { computeAge } from '../utils/computeAge.js';

const adminController = {
  // Login page
  index: async (req, res) => {
    res.render('login');
  },

  // Login process
  login: async (req, res) => {
    // Schema definition for the request body
    const loginSchema = Joi.object({
      email: Joi.string()
        .max(255)
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
        .required(),
      password: Joi.string().required(),
    });

    // Data extraction from the request body
    const { email, password } = req.body;

    // Validate the request body
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .render('error', { error: error.message, statusCode: 400 });
    }

    // Find the admin user in the database
    const foundAdmin = await Admin.findOne({
      where: { email: email },
    });

    if (!foundAdmin) {
      return res
        .status(404)
        .render('error', { error: 'Admin not found', statusCode: 404 });
    }

    // Compare the passwords
    const isGood = await Scrypt.compare(password, foundAdmin.password);

    if (!isGood) {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
    const adminName = foundAdmin.name;

    // Redirect to dashboard or another page after successful login
    return res.status(200).render('dashboard', { adminName });
  },

  // Render all pending users
  renderPendingUsers: async (req, res) => {
    // Find all users with status 'pending'
    const pendingUsers = await User.findAll({
      where: {
        status: 'pending',
      },
      attributes: ['id', 'name', 'birth_date', 'status'],
      order: [['id', 'ASC']],
    });

    // Compute the age of each user
    const pendingUsersWithAge = pendingUsers.map((user) => ({
      ...user.toJSON(),
      age: computeAge(user.birth_date),
    }));
    // Render the users page with the users data
    return res.status(200).render('users', { users: pendingUsersWithAge });
  },

  // Render all users
  renderAllUsers: async (req, res) => {
    // Find all users
    const users = await User.findAll({
      attributes: ['id', 'name', 'birth_date', 'status'],
      order: [
        ['status', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    if (users) {
      res.locals.displayAll = true;
    }

    // Compute the age of each user
    const usersWithAge = users.map((user) => ({
      ...user.toJSON(),
      age: computeAge(user.birth_date),
    }));
    // Render the users page with the users data
    return res.status(200).render('users', { users: usersWithAge });
  },

  // Render a specific user
  renderUser: async (req, res) => {
    const { id } = req.params;

    // Find the user by id
    const user = await User.findByPk(id, {
      include: [
        {
          model: Hobby,
          as: 'hobbies',
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .render('error', { error: 'User not found', statusCode: 404 });
    }

    //
    const userAge = computeAge(user.birth_date);
    const newUser = {
      ...user.toJSON(),
      age: userAge,
    };

    // Render the user page with the user data
    return res.status(200).render('user', { user: newUser });
  },

  // Render all banished users
  renderBanishedUsers: async (req, res) => {
    // Find all users with status 'banned'
    const banishedUsers = await User.findAll({
      where: {
        status: 'banned',
      },
      attributes: ['id', 'name', 'birth_date', 'status'],
      order: [['id', 'ASC']],
    });

    // Compute the age of each user
    const banishedUsersWithAge = banishedUsers.map((user) => ({
      ...user.toJSON(),
      age: computeAge(user.birth_date),
    }));

    // Render the users page with the users data
    return res.status(200).render('users', { users: banishedUsersWithAge });
  },

  // Update the status of a user
  updateUserStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Find the user by id
    const user = await User.findByPk(id, {
      include: [
        {
          model: Hobby,
          as: 'hobbies',
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .render('error', { error: 'User not found', statusCode: 404 });
    }

    // Update the status of the user
    const updatedUser = await user.update({
      status,
    });

    //
    return res.status(200);
  },

  // Render all events
  renderEvents: async (req, res) => {
    // Find all events
    const events = await Event.findAll({
      attributes: ['id', 'name', 'date'],
    });

    // Render the events page with the events data
    return res.status(200).render('events', { events });
  },
};

export default adminController;
