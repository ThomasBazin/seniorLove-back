import 'dotenv/config';
import express from 'express';
import { publicRouter } from './src/routers/publicRouter.js';
import { privateRouter } from './src/routers/privateRouter.js';
import { bodySanitizerMiddleware } from './src/utils/bodySanitizer.js';
import { checkLoggedIn } from './src/utils/checkLoggedIn.js';
import cors from 'cors';

const app = express();
app.use(cors(process.env.ALLOWED_DOMAINS || '*'));

app.use(express.urlencoded({ extended: true })); // Parser les bodies de type "application/www-form-urlencoded"
app.use(express.json()); // Parser les bodies de type "application/json"

app.use(bodySanitizerMiddleware);

app.use('/api/public', publicRouter);
app.use('/api/private', checkLoggedIn, privateRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`❤️  SeniorLove server listening at http://localhost:${port} ❤️`);
});
