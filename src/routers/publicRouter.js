import { Router } from 'express';

import * as hobbyController from '../controllers/hobbyController.js';
import { controllerWrapper as cw } from '../middlewares/controllerWrapper.js';
import * as eventController from '../controllers/eventController.js';
import * as authController from '../controllers/authController.js';
export const publicRouter = Router();

publicRouter.get('/home', (req, res) => {
  res.send('Bonjour');
});

publicRouter.get('/events', cw(eventController.getAllEvents));

publicRouter.get('/events/:eventId', cw(eventController.getOneEvent));

publicRouter.post('/register', cw(authController.addUser));

publicRouter.post('/login', cw(authController.loginUser));

publicRouter.get('/logout', cw(authController.logoutUser));

publicRouter.get('/hobbies', cw(hobbyController.getHobbies));

//Test sanitize
//publicRouter.post('/sanitize', cw(authController.postSanitize));


