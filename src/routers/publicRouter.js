import { Router } from "express";

import * as hobbyController from "../controllers/hobbyController.js";
import * as userController from "../controllers/userController.js";
import {serverController as tc} from '../utils/tryCatch.js'
import * as eventController from "../controllers/eventController.js";
import * as  authController from '../controllers/authController.js'
export const publicRouter = Router();



publicRouter.get('/home', (req, res) => {
    res.send('Bonjour')
});

publicRouter.get('/events', tc(eventController.getAllEvents));

publicRouter.get('/events/:eventId',tc(eventController.getOneEvent));

publicRouter.post('/register', tc(authController.addUser));

publicRouter.post('/login', tc(authController.loginUser));

publicRouter.get('/logout', tc(authController.logoutUser))

publicRouter.get('/hobbies', tc(hobbyController.getHobbies));


