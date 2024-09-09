import { Router } from 'express';

export const adminRouter = Router();

adminRouter.get('/home', (req, res) => {
  res.send('Nous sommes des admins !!! :P');
});
