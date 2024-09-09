import { Router } from 'express';
import adminController from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.get('/login', adminController.index);
adminRouter.post('/login', adminController.login);

adminRouter.get('/users', adminController.renderAllUsers);
