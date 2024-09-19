import { Admin, User, Hobby, Event } from '../models/index.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';
import computeAge from '../utils/computeAge.js';
import { Event_hobby } from '../models/associative_tables/Event_hobby.js';
import { v2 as cloudinary } from 'cloudinary';

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
      return res.status(400).render('login', {
        error: "Format de l'email incorrect",
        statusCode: 400,
      });
    }

    // Find the admin user in the database
    const foundAdmin = await Admin.findOne({
      where: { email: email },
    });

    if (!foundAdmin) {
      return res.status(401).render('login', {
        error: 'Email et/ou Mot de passe invalide',
        statusCode: 404,
      });
    }

    // Compare the passwords
    const isGood = await Scrypt.compare(password, foundAdmin.password);

    if (!isGood) {
      return res.status(401).render('login', {
        error: 'Email et/ou Mot de passe invalide',
        statusCode: 404,
      });
    } else {
      req.session.admin = true;
      req.session.adminId = foundAdmin.id;
    }
    // Redirect to dashboard or another page after successful login
    return res.status(200).redirect('/users/pending');
  },

  // Logout process
  logout: async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .render('error', { error: 'Failed to logout', statusCode: 500 });
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
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
      return res.status(401).redirect('/');
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
      return res.status(401).redirect('/');
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
      return res.status(401).redirect('/');
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
      return res.status(401).redirect('/');
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

      if (status) {
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
        await user.update({
          status,
        });

        //
        return res.status(204);
      }
    } else {
      return res.status(401).redirect('/');
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

      if (user.picture_id) {
        await cloudinary.uploader.destroy(user.picture_id);
      }

      if (!user) {
        return res
          .status(404)
          .render('error', { error: 'User not found', statusCode: 404 });
      }

      // Delete the user
      await user.destroy();

      res.status(204).json({ message: 'User deleted successfully' });
    } else {
      return res.status(401).redirect('/');
    }
  },

  // Render all events
  renderEvents: async (req, res) => {
    if (req.session.admin) {
      // Find all events
      const events = await Event.findAll({
        attributes: ['id', 'name', 'date'],
        order: [['date', 'ASC']],
      });

      // Render the events page with the events data
      return res.status(200).render('events', { events });
    } else {
      return res.status(401).redirect('/');
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
      return res.status(401).redirect('/');
    }
  },

  // Create an event
  createEvent: async (req, res) => {
    // Check if the user is an admin
    if (req.session.admin) {
      // Extract event details from the request body
      const { name, date, location, time, hobbies, description } = req.body;

      // Extract file details from the request
      const picture = req.file.path; // Path to the uploaded image
      const picture_id = req.file.filename; // Filename for the uploaded image

      // Extract admin ID from the session
      const adminId = req.session.adminId;

      // Validate required fields
      if (!name || !date || !location || !time || !description || !adminId) {
        return res
          .status(400)
          .render('error', { error: 'Missing event data', statusCode: 400 });
      }

      // Create a new event in the database
      const newEvent = await Event.create({
        name,
        location,
        description,
        picture,
        picture_id,
        date,
        time,
        adminId,
      });

      // Check if hobbies is an array with elements
      if (Array.isArray(hobbies) && hobbies.length > 0) {
        // Map hobbies to an array of Event_hobby entries
        const hobbiesArray = hobbies.map((hobbyId) => ({
          event_id: newEvent.id,
          hobby_id: hobbyId,
        }));
        // Bulk create hobby associations
        await Event_hobby.bulkCreate(hobbiesArray);
        // Check if hobbies is a single value
      } else if (hobbies) {
        // Create a single hobby association
        const hobby = {
          event_id: newEvent.id,
          hobby_id: hobbies,
        };
        await Event_hobby.create(hobby);
      }

      // Redirect to the events page after the event creation
      return res.status(204).redirect('/events');
    } else {
      // If not an admin, redirect to login page
      return res.status(401).redirect('/');
    }
  },

  // Delete an event
  deleteEvent: async (req, res) => {
    if (req.session.admin) {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .render('error', { error: 'Missing event id', statusCode: 400 });
      }
      const event = await Event.findByPk(id);
      if (event.picture_id) {
        const cloudinaryId = event.picture_id;
        await cloudinary.uploader.destroy(cloudinaryId);
      }

      if (!event) {
        return res
          .status(404)
          .render('error', { error: 'Event not found', statusCode: 404 });
      }

      await event.destroy();
      res.status(204).json({ message: 'Event deleted successfully' });
    } else {
      return res.status(401).redirect('/');
    }
  },

  // Render the update event page
  renderUpdateEvent: async (req, res) => {
    if (req.session.admin) {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .render('error', { error: 'Missing event id', statusCode: 400 });
      }
      const event = await Event.findByPk(id, {
        include: [
          {
            model: Hobby,
            as: 'hobbies',
            attributes: ['id', 'name'],
            through: { attributes: [] },
          },
        ],
      });

      if (!event) {
        return res
          .status(404)
          .render('error', { error: 'Event not found', statusCode: 404 });
      }

      const allHobbies = await Hobby.findAll({
        attributes: ['id', 'name'],
      });

      // Create an array of event hobbies names
      const hobbiesFilter = [];
      event.hobbies.forEach((hobby) => {
        hobbiesFilter.push(hobby.dataValues.name);
      });

      const hobbiesChecked = [];
      event.hobbies.forEach((hobby) => {
        hobbiesChecked.push(hobby.dataValues);
      });

      // Create an array of all hobbies data
      const allHobbiesData = [];
      allHobbies.forEach((hobby) => {
        allHobbiesData.push(hobby.dataValues);
      });

      // Create an array of hobbies that are not checked
      const hobbiesUncheck = allHobbiesData.filter(
        (hobby) => !hobbiesFilter.includes(hobby.name)
      );

      if (event) {
        res.locals.updateEvent = true;
      }
      return res
        .status(200)
        .render('createEvent', { event, hobbiesUncheck, hobbiesChecked });
    } else {
      return res.status(401).redirect('/');
    }
  },

  // Update an event
  updateEvent: async (req, res) => {
    // Check if the user is an admin
    if (req.session.admin) {
      // Extract event details from the request body
      const { name, date, location, time, hobbies, description } = req.body;

      // Validate that all required fields are provided
      if (!name || !date || !location || !time || !description) {
        return res
          .status(400)
          .render('error', { error: 'Missing event data', statusCode: 400 });
      }

      // Find the event to update by primary key (ID), including associated hobbies
      const eventToUpdate = await Event.findByPk(req.params.id, {
        include: [
          {
            model: Hobby,
            as: 'hobbies',
          },
        ],
      });

      // Initialize picture and picture_id with existing values from the event
      let picture = eventToUpdate.picture;
      let picture_id = eventToUpdate.picture_id;

      // Check if a new file was uploaded
      if (req.file) {
        // Extract the old public ID for the image from picture_id
        const oldPictureId = picture_id;

        // Update picture path and ID with the new file details
        picture = req.file.path;
        picture_id = req.file.filename;

        // Delete the old image from Cloudinary
        await cloudinary.uploader.destroy(oldPictureId);
      }

      // Update the event record with the new details
      await eventToUpdate.update({
        name,
        location,
        description,
        picture,
        picture_id,
        date,
        time,
      });

      // Remove existing hobby associations for the event
      await Event_hobby.destroy({
        where: {
          event_id: eventToUpdate.id,
        },
      });

      // Check if hobbies is an array with elements
      if (Array.isArray(hobbies) && hobbies.length > 0) {
        // Map hobbies to an array of Event_hobby entries
        const hobbiesArray = hobbies.map((hobbyId) => ({
          event_id: eventToUpdate.id,
          hobby_id: hobbyId,
        }));
        // Bulk create hobby associations
        await Event_hobby.bulkCreate(hobbiesArray);
        // Check if hobbies is a single value
      } else if (hobbies) {
        // Create a single hobby association
        const hobby = {
          event_id: eventToUpdate.id,
          hobby_id: hobbies,
        };
        await Event_hobby.create(hobby);
      }

      // Respond with a success message and updated event data
      return res
        .status(200)
        .json({ message: 'Event modified successfully', event: eventToUpdate });
    } else {
      // If not an admin, redirect to login page
      return res.status(401).redirect('/');
    }
  },
  render404Error: async (req, res) => {
    return res.status(404).render('error', {
      error: 'Page not found',
      statusCode: 404,
    });
  },
};

export default adminController;
