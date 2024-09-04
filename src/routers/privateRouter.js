import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { serverController as tc } from '../utils/tryCatch.js';

export const privateRouter = Router();

privateRouter.get('/users/me', tc(userController.getConnectedUser));
privateRouter.patch('/users/me', tc(userController.updateUser));

privateRouter.delete('/users/me', tc(userController.deleteUser));

privateRouter.put(
  '/events/:eventId/register',
  tc(userController.addUserToEvent)
);
privateRouter.delete(
  '/events/:eventId/unregister',

  tc(userController.deleteUserToEvent)
);

//TODO: a faire coté front >>
//privateRouter.patch('/logout',checkLoggedIn, tc(authController.logoutUser));
