import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { controllerWrapper as cw } from '../utils/controllerWrapper.js';

export const privateRouter = Router();

privateRouter.get('/users/me', cw(userController.getConnectedUser));
privateRouter.patch('/users/me', cw(userController.updateUser));

privateRouter.delete('/users/me', cw(userController.deleteUser));

privateRouter.put(
  '/events/:eventId/register',
  cw(userController.addUserToEvent)
);
privateRouter.delete(
  '/events/:eventId/unregister',

  cw(userController.deleteUserToEvent)
);

//TODO: a faire coté front >>
//privateRouter.patch('/logout',checkLoggedIn, tc(authController.logoutUser));
