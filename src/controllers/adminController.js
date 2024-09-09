import { Admin, User, Hobby } from '../models/index.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import { computeAge } from '../utils/computeAge.js';

const adminController = {
  index: async (req, res) => {
    res.render('login'); // Ensure this matches your view filename
  },
  home: async (req, res) => {
    const loginSchema = Joi.object({
      email: Joi.string()
        .max(255)
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
        .required(),
      password: Joi.string().required(),
    });

    const { email, password } = req.body;

    // Validate the request body
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).render('login', { error: error.message });
    }

    // Find the admin user in the database
    const foundAdmin = await Admin.findOne({
      where: { email: email },
    });

    if (!foundAdmin) {
      return res.status(404).render('login', { error: 'Admin not found' });
    }

    // Compare the passwords
    const isGood = await Scrypt.compare(password, foundAdmin.password);

    if (!isGood) {
      return res.status(401).render('login', { error: 'Not authorized' });
    }

    const pendingUsers = await User.findAll({
      where: {
        status: 'pending',
      },
      attributes: ['id', 'name', 'birth_date', 'status'],
    });
    const pendingUsersWithAge = pendingUsers.map((user) => ({
      // Convert Sequelize model instance to a plain object
      ...user.toJSON(),
      // Add computed age
      age: computeAge(user.birth_date),
    }));
    // Redirect to dashboard or another page after successful login
    return res.status(200).render('home', { users: pendingUsersWithAge });
  },
  renderPendingUsers: async (req, res) => {
    const pendingUsers = await User.findAll({
      where: {
        status: 'pending',
      },
      attributes: ['id', 'name', 'birth_date', 'status'],
    });
    const pendingUsersWithAge = pendingUsers.map((user) => ({
      ...user.toJSON(),
      age: computeAge(user.birth_date),
    }));
    return res.status(200).render('home', { users: pendingUsersWithAge });
  },
  renderAllUsers: async (req, res) => {
    const users = await User.findAll({
      attributes: ['id', 'name', 'birth_date', 'status'],
    });
    if (users) {
      res.locals.displayAll = true;
    }
    const usersWithAge = users.map((user) => ({
      ...user.toJSON(),
      age: computeAge(user.birth_date),
    }));
    return res.status(200).render('home', { users: usersWithAge });
  },
  renderUser: async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        {
          model: Hobby,
          as: 'hobbies',
        },
      ],
    });
    if (!user) {
      return res.status(404).render('home', { error: 'User not found' });
    }
    const userAge = computeAge(user.birth_date);
    const newUser = {
      ...user.toJSON(),
      age: userAge,
    };

    return res.status(200).render('user', { user: newUser });
  },
};

export default adminController;
