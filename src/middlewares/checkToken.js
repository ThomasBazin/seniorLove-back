import 'dotenv/config';
import jsonwebtoken from 'jsonwebtoken';

export function checkToken(req, res, next) {
  // Add user to req if token exist and is valid
  const authorization = req.headers.authorization;

  if (authorization) {
    const token = authorization.split(' ')[1];
    try {
      jsonwebtoken.verify(token, process.env.TOKEN_KEY);
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
  next();
}
