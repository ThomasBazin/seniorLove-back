import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { publicRouter } from './src/routers/publicRouter.js';
import { privateRouter } from './src/routers/privateRouter.js';
import { bodySanitizerMiddleware } from './src/middlewares/bodySanitizer.js';
import { checkLoggedIn } from './src/middlewares/checkLoggedIn.js';
import cors from 'cors';
import { adminRouter } from './src/routers/adminRouter.js';
import session from 'express-session';

// Convert import.meta.url to __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors(process.env.ALLOWED_DOMAINS || '*'));

app.use(express.urlencoded({ extended: true })); // Parser les bodies de type "application/www-form-urlencoded"
app.use(express.json()); // Parser les bodies de type "application/json"

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

app.use(bodySanitizerMiddleware);

app.disable('x-powered-by');
app.use('/api/public', publicRouter);
app.use('/api/private', checkLoggedIn, privateRouter);

// Body parser
app.use(express.urlencoded({ extended: true }));
// Setup view engine
app.set('view engine', 'ejs');
app.set('views', './src/views');
// Statically served files
app.use(express.static(path.join(__dirname, 'src/assets')));

app.use('/admin', adminRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`❤️  SeniorLove server listening at http://localhost:${port} ❤️`);
});
