import { Admin, User, Hobby, Event } from '../models/index.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import { computeAge } from '../utils/computeAge.js';
import { Event_hobby } from '../models/associative_tables/Event_hobby.js';

const adminController = {
  // Login page
  index: async (req, res) => {
    res.status(200).render('login');
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

    if (!email || !password) {
      return res.status(400).render('error', {
        error: 'Missing email or password',
        statusCode: 400,
      });
    }

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
    } else {
      req.session.admin = foundAdmin;
    }

    const adminName = foundAdmin.name;

    // Redirect to dashboard or another page after successful login
    return res.status(200).render('dashboard', { adminName });
  },

  // Logout process
  logout: async (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
  },

  // Render all users
  renderAllUsers: async (req, res) => {
    if (req.session.admin) {
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
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },

  // Render all pending users
  renderPendingUsers: async (req, res) => {
    if (req.session.admin) {
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
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },

  // Render a specific user
  renderUser: async (req, res) => {
    if (req.session.admin) {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .render('error', { error: 'Missing user id', statusCode: 400 });
      }

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
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },

  // Render all banished users
  renderBanishedUsers: async (req, res) => {
    if (req.session.admin) {
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
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },

  // Update the status of a user
  updateUserStatus: async (req, res) => {
    if (req.session.admin) {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .render('error', { error: 'Missing user id', statusCode: 400 });
      }

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
      return res.status(204);
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },

  // Delete a user
  deleteUser: async (req, res) => {
    if (req.session.admin) {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .render('error', { error: 'Missing user id', statusCode: 400 });
      }

      // Find the user by id
      const user = await User.findByPk(id);

      if (!user) {
        return res
          .status(404)
          .render('error', { error: 'User not found', statusCode: 404 });
      }

      // Delete the user
      await user.destroy();

      res.status(204).json({ message: 'User deleted successfully' });
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },

  // Render all events
  renderEvents: async (req, res) => {
    if (req.session.admin) {
      // Find all events
      const events = await Event.findAll({
        attributes: ['id', 'name', 'date'],
        order: [['date', 'DESC']],
      });

      // Render the events page with the events data
      return res.status(200).render('events', { events });
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },

  // Render the create event page
  renderCreateEvent: async (req, res) => {
    if (req.session.admin) {
      const hobbies = await Hobby.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      });
      return res.status(200).render('createEvent', { hobbies });
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },

  // Create an event
  createEvent: async (req, res) => {
    if (req.session.admin) {
      const { name, date, picture, location, time, hobbies, description } =
        req.body;

      const adminId = req.session.admin.id;

      if (!name || !date || !location || !time || !description || !adminId) {
        return res
          .status(400)
          .render('error', { error: 'Missing event data', statusCode: 400 });
      }
      // Create the event
      const newEvent = await Event.create({
        name,
        location,
        description,
        picture,
        date,
        time,
        description,
        adminId,
      });

      // Check if hobbies are provided
      if (hobbies && hobbies.length > 0) {
        // Assuming `hobbies` is an array of hobby IDs
        const hobbiesArray = hobbies.map((hobbyId) => ({
          event_id: newEvent.id,
          hobby_id: hobbyId,
        }));

        // Insert relationships into the `events_hobbies` table
        await Event_hobby.bulkCreate(hobbiesArray);
      }

      // Redirect to the events page after the event creation
      return res.status(204).redirect('/admin/events');
    } else {
      return res
        .status(401)
        .render('error', { error: 'Not authorized', statusCode: 401 });
    }
  },
};

export default adminController;
