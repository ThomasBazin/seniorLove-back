import { Router } from 'express';
import adminController from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.get('/login', adminController.index);
adminRouter.post('/login', adminController.login);

adminRouter.get('/users', adminController.renderAllUsers);
adminRouter.get('/users/pending', adminController.renderPendingUsers);
adminRouter.get('/users/banished', adminController.renderBanishedUsers);
adminRouter.get('/users/:id', adminController.renderUser);
adminRouter.post('/users/:id/status', adminController.updateUserStatus);

adminRouter.get('/events', adminController.renderEvents);
