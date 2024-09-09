import 'dotenv/config';
import express from 'express';
import { publicRouter } from './src/routers/publicRouter.js';
import { privateRouter } from './src/routers/privateRouter.js';
import { bodySanitizerMiddleware } from './src/middlewares/bodySanitizer.js';
import { checkLoggedIn } from './src/middlewares/checkLoggedIn.js';
import cors from 'cors';
import { adminRouter } from './src/routers/adminRouter.js';

const app = express();
app.use(cors(process.env.ALLOWED_DOMAINS || '*'));

app.use(express.urlencoded({ extended: true })); // Parser les bodies de type "application/www-form-urlencoded"
app.use(express.json()); // Parser les bodies de type "application/json"

app.use(bodySanitizerMiddleware);

app.disable('x-powered-by');
app.use('/api/public', publicRouter);
app.use('/api/private', checkLoggedIn, privateRouter);

// Body parser
app.use(express.urlencoded({ extended: true }));
// Setup view engine
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use('/admin', adminRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`❤️  SeniorLove server listening at http://localhost:${port} ❤️`);
});
