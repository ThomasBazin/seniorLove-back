import { Router } from 'express';
import multer from 'multer';
import { eventPhotoStorage } from '../cloudinary/index.js';
const uploadEventPhoto = multer({ storage: eventPhotoStorage });

import { controllerWrapper as cw } from '../middlewares/controllerWrapper.js';
import adminController from '../controllers/adminController.js';
import { checkAdminAuth } from '../middlewares/checkAdminAuth.js';

export const adminRouter = Router();

adminRouter.get('/', cw(adminController.index));
adminRouter.post('/login', cw(adminController.login));

adminRouter.get('/logout', checkAdminAuth, cw(adminController.logout));
adminRouter.get('/users', checkAdminAuth, cw(adminController.renderAllUsers));
adminRouter.get(
  '/users/pending',
  checkAdminAuth,
  cw(adminController.renderPendingUsers)
);
adminRouter.get(
  '/users/banished',
  checkAdminAuth,
  cw(adminController.renderBanishedUsers)
);
adminRouter.get('/users/:id', checkAdminAuth, cw(adminController.renderUser));
adminRouter.patch(
  '/users/:id/status',
  checkAdminAuth,
  cw(adminController.updateUserStatus)
);
adminRouter.delete(
  '/users/:id/delete',
  checkAdminAuth,
  cw(adminController.deleteUser)
);

adminRouter.get('/events', checkAdminAuth, cw(adminController.renderEvents));
adminRouter.get(
  '/events/create',
  checkAdminAuth,
  cw(adminController.renderCreateEvent)
);
adminRouter.post(
  '/events/create',
  checkAdminAuth,
  uploadEventPhoto.single('photo'),
  cw(adminController.createEvent)
);
adminRouter.delete(
  '/events/:id/delete',
  checkAdminAuth,
  cw(adminController.deleteEvent)
);
adminRouter.get(
  '/events/:id',
  checkAdminAuth,
  cw(adminController.renderUpdateEvent)
);
adminRouter.patch(
  '/events/:id/update',
  checkAdminAuth,
  uploadEventPhoto.single('picture'),
  cw(adminController.updateEvent)
);

adminRouter.get('*', cw(adminController.render404Error));
