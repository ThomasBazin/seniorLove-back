import 'dotenv/config';
import jsonwebtoken from 'jsonwebtoken';

export function checkLoggedIn(req, res, next) {
  // Add user to req if token exist and is valid
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: 'Unauthorized, no token found' });
  }

  const token = authorization.split(' ')[1];
  try {
    const jwtContent = jsonwebtoken.verify(token, process.env.TOKEN_KEY);
    req.user = jwtContent;
  } catch (err) {
    //return 401
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
}
