import { Router } from 'express';
import adminController from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.get('/home', adminController.index); // Ensure adminController.index is defined
adminRouter.post('/login', adminController.login); // Ensure adminController.login is defined
