import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as messageController from '../controllers/messageController.js';
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

privateRouter.get(
  '/users/me/suggestions',
  checkLoggedIn,
  tc(userController.getAllSameInterestUsers)
);

privateRouter.get(
  '/users/:userId',
  checkLoggedIn,
  tc(userController.getOneUser)
);

privateRouter.get(
  '/messages',
  checkLoggedIn,
  tc(messageController.getAllUserMessages)
);

privateRouter.get(
  '/contacts',
  checkLoggedIn,
  tc(messageController.getAllUserContacts)
);

privateRouter.post(
  '/messages',
  checkLoggedIn,
  tc(messageController.sendMessageToUser)
);
