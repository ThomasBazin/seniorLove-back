import { Router } from 'express';
import adminController from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.get('/login', adminController.index);
adminRouter.post('/home', adminController.home);

adminRouter.get('/users', adminController.renderAllUsers);
adminRouter.get('/home', adminController.renderPendingUsers);
adminRouter.get('/users/:id', adminController.renderUser);
adminRouter.get('/events', adminController.renderEvents);
