import 'dotenv/config';

import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to SeniorLove !');
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`❤️  SeniorLove server listening at http://localhost:${port} ❤️`);
});
