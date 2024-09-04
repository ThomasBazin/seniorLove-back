import { Router } from "express";
import * as userController from '../controllers/userController.js'
import {serverController as tc} from '../utils/tryCatch.js'

import { checkLoggedIn } from "../utils/checkLoggedIn.js";

export const privateRouter = Router();


privateRouter.get('/users/me',checkLoggedIn, tc(userController.getConnectedUser));
privateRouter.patch('/users/me',checkLoggedIn, tc(userController.updateUserProfile));
