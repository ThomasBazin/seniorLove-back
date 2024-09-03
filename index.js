import 'dotenv/config';
import express from 'express';
import { router } from './src/routers/router.js';


const app = express();

app.use(express.urlencoded({ extended: true })); // Parser les bodies de type "application/www-form-urlencoded"
app.use(express.json()); // Parser les bodies de type "application/json"

app.use(router);



const port = process.env.PORT;
app.listen(port, () => {
  console.log(`❤️  SeniorLove server listening at http://localhost:${port} ❤️`);
});
