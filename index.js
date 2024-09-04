import 'dotenv/config';
import express from 'express';
import { publicRouter } from './src/routers/publicRouter.js';
import { privateRouter } from './src/routers/privateRouter.js';
import jsonwebtoken from 'jsonwebtoken';
import { bodySanitizerMiddleware } from './src/utils/bodySanitizer.js';
import { checkLoggedIn } from './src/utils/checkLoggedIn.js';

const app = express();

// Secret du token
export const jwtSecret = 'Sen1@rL0ve';

app.use(express.urlencoded({ extended: true })); // Parser les bodies de type "application/www-form-urlencoded"
app.use(express.json()); // Parser les bodies de type "application/json"

// Add user to req if token exist and is valid
app.use((req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.split(' ')[1];
    try {
      const jwtContent = jsonwebtoken.verify(token, jwtSecret);
      req.user = jwtContent;
    } catch (err) {
      console.log('Invalid token', err);
    }
  }
  console.log(req.user);
  next();
});

app.use(bodySanitizerMiddleware);

app.use('/api', publicRouter);
app.use('/api', checkLoggedIn, privateRouter);
//app.use(publicRouter);
//app.use(privateRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`❤️  SeniorLove server listening at http://localhost:${port} ❤️`);
});
