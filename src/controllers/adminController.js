import { Admin } from '../models/index.js';
import { Scrypt } from '../auth/Scrypt.js';
import Joi from 'joi';

const adminController = {
  index: async (req, res) => {
    res.render('home'); // Ensure this matches your view filename
  },
  login: async (req, res) => {
    const loginSchema = Joi.object({
      email: Joi.string()
        .max(255)
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } })
        .required(),
      password: Joi.string().required(),
    });

    const { email, password } = req.body;

    // Validate the request body
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).render('login', { error: error.message });
    }

    // Find the admin user in the database
    const foundAdmin = await Admin.findOne({
      where: { email: email },
    });

    if (!foundAdmin) {
      return res.status(404).render('login', { error: 'Admin not found' });
    }

    // Compare the passwords
    const isGood = await Scrypt.compare(password, foundAdmin.password);

    if (!isGood) {
      return res.status(401).render('login', { error: 'Not authorized' });
    }

    // Redirect to dashboard or another page after successful login
    return res.status(200).redirect('/dashboard');
  },
};

export default adminController;
