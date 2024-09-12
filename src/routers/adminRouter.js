import { Router } from 'express';
import multer from 'multer';
import storage from '../cloudinary/index.js';
const upload = multer({ storage });

import { controllerWrapper as cw } from '../middlewares/controllerWrapper.js';
import adminController from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.get('/login', cw(adminController.index));
adminRouter.post('/login', cw(adminController.login));
adminRouter.get('/logout', cw(adminController.logout));

adminRouter.get('/users', cw(adminController.renderAllUsers));
adminRouter.get('/users/pending', cw(adminController.renderPendingUsers));
adminRouter.get('/users/banished', cw(adminController.renderBanishedUsers));
adminRouter.get('/users/:id', cw(adminController.renderUser));
adminRouter.patch('/users/:id/status', cw(adminController.updateUserStatus));
adminRouter.delete('/users/:id/delete', cw(adminController.deleteUser));

adminRouter.get('/events', cw(adminController.renderEvents));
adminRouter.get('/events/create', cw(adminController.renderCreateEvent));
adminRouter.post(
  '/events/create',
  upload.single('picture'),
  cw(adminController.createEvent)
);
adminRouter.delete('/events/:id/delete', cw(adminController.deleteEvent));
adminRouter.get('/events/:id', cw(adminController.renderUpdateEvent));
adminRouter.patch('/events/:id/update', cw(adminController.updateEvent));
