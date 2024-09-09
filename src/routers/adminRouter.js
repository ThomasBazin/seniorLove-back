import { Router } from 'express';
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
adminRouter.post('/users/:id/status', cw(adminController.updateUserStatus));

adminRouter.get('/events', cw(adminController.renderEvents));
