import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as messageController from '../controllers/messageController.js';
import { controllerWrapper as cw } from '../middlewares/controllerWrapper.js';
import { checkLoggedIn } from '../middlewares/checkLoggedIn.js';

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

privateRouter.get(
  '/users/me/suggestions',
  checkLoggedIn,
  cw(userController.getAllSameInterestUsers)
);

privateRouter.get(
  '/users/:userId',
  checkLoggedIn,
  cw(userController.getOneUser)
);

privateRouter.get(
  '/messages',
  checkLoggedIn,
  cw(messageController.getAllUserMessages)
);

privateRouter.get(
  '/contacts',
  checkLoggedIn,
  cw(messageController.getAllUserContacts)
);

privateRouter.post(
  '/messages',
  checkLoggedIn,
  cw(messageController.sendMessageToUser)
);
privateRouter.get('/users', checkLoggedIn, cw(userController.getAllUsers));
privateRouter.patch(
  '/users/me',
  checkLoggedIn,
  cw(userController.updateUserProfile)
);
