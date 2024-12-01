import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { publicRouter } from './src/routers/publicRouter.js';
import { privateRouter } from './src/routers/privateRouter.js';
import { bodySanitizerMiddleware } from './src/middlewares/bodySanitizer.js';
import { checkLoggedIn } from './src/middlewares/checkLoggedIn.js';
import { checkToken } from './src/middlewares/checkToken.js';
import cors from 'cors';
import { adminRouter } from './src/routers/adminRouter.js';
import session from 'express-session';

// Convert import.meta.url to __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production' ? process.env.ALLOWED_DOMAINS : '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.disable('x-powered-by');

app.use(express.json()); // Parser les bodies de type "application/json"
app.use(express.urlencoded({ extended: true })); // Parser les bodies de type "application/www-form-urlencoded"

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', './src/views');
// Statically served files
app.use(express.static(path.join(__dirname, 'src/assets')));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: 'Guess it!',
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60, // ça fait une heure
    },
  })
);

app.use(checkToken);

app.use(bodySanitizerMiddleware);
app.use('/api/public', publicRouter);
app.use('/api/private', checkLoggedIn, privateRouter);

app.use('/', adminRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`❤️  SeniorLove server started ❤️`);
  console.log('Environment ==> ', process.env.NODE_ENV);
});

export default app;
