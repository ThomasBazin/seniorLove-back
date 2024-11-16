import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as messageController from '../controllers/messageController.js';
import { controllerWrapper as cw } from '../middlewares/controllerWrapper.js';

import multer from 'multer';
import { userPhotoStorage } from '../cloudinary/index.js';
const uploadUserPhoto = multer({ storage: userPhotoStorage });

export const privateRouter = Router();

privateRouter.get('/users/me', cw(userController.getConnectedUser));
privateRouter.get('/users', cw(userController.getAllUsers));
privateRouter.patch('/users/me', cw(userController.updateUserProfile));

privateRouter.post(
  '/users/:userId/uploadPhoto',
  uploadUserPhoto.single('new-image'),
  userController.uploadUserPhoto
);

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
  cw(userController.getAllSameInterestUsers)
);

privateRouter.get('/users/:userId', cw(userController.getOneUser));

privateRouter.get('/messages', cw(messageController.getAllUserMessages));

privateRouter.get('/contacts', cw(messageController.getAllUserContacts));

privateRouter.post('/messages', cw(messageController.sendMessageToUser));

privateRouter.delete('/users/me/delete', cw(userController.deleteUser));
