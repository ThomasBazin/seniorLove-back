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
  tc(userController.getAllUserMessages)
);

privateRouter.get(
  '/contacts',
  checkLoggedIn,
  tc(userController.getAllUserContacts)
);

privateRouter.post(
  '/messages',
  checkLoggedIn,
  tc(messageController.sendMessageToUser)
);
