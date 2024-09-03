import { Router } from "express";

import * as hobbyController from "../controllers/hobbyController.js";
import * as userController from "../controllers/userController.js";
import {serverController as tc} from '../utils/tryCatch.js'

export const router = Router();

router.get('/home', (req, res) => {
    res.send('Bonjour')
});

router.get('/events', tc());

router.get('/events/:eventId', (req, res) => {
    res.send('Bonjour')
});

router.post('/register', tc(userController.addUser));

router.post('/login', tc(userController.loginUser))

router.get('/hobbies', tc(hobbyController.getHobbies));


