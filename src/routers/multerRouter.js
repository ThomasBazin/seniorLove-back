import { Router } from 'express';
export const multerRouter = Router();
import multerController from '../controllers/multerController.js';

import multer from 'multer';

import storage from '../cloudinary/index.js';

const upload = multer({ storage });

// test multer
multerRouter.post(
  '/test',
  upload.single('picture'),
  multerController.testMulter
);
// we can use upload.array to upload multiple files -> we need to add
// "multiple" to the input in the form and req.files in the controller
