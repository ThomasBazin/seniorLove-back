import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { serverController as tc } from '../utils/tryCatch.js';

import { checkLoggedIn } from '../utils/checkLoggedIn.js';

export const privateRouter = Router();

privateRouter.get(
  '/users/me',
  checkLoggedIn,
  tc(userController.getConnectedUser)
);
privateRouter.patch('/users/me', checkLoggedIn, tc(userController.updateUser));

privateRouter.delete('/users/me', checkLoggedIn, tc(userController.deleteUser));

privateRouter.put(
  '/events/:eventId/register',
  checkLoggedIn,
  tc(userController.addUserToEvent)
);
privateRouter.delete(
  '/events/:eventId/unregister',
  checkLoggedIn,
  tc(userController.deleteUserToEvent)
);

//TODO: a faire coté front >>
//privateRouter.patch('/logout',checkLoggedIn, tc(authController.logoutUser));
