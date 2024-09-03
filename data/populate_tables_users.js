import { pgClient } from './pgClient.js';
import { Scrypt } from '../src/auth/Scrypt.js';
import users from './users_data_70.json' assert { type: 'json' };

await pgClient.connect();

for (const user of users) {
  const name = user.name;
  const birth = user.birth_date;
  const description = user.description;
  const gender = user.gender;
  const picture = user.picture;
  const email = user.email;
  const password = Scrypt.hash(user.password);
  const status = user.status;

  const query = `INSERT INTO users (name, birth_date, description, gender, picture, email, password, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;

  const result = await pgClient.query(query, [
    name,
    birth,
    description,
    gender,
    picture,
    email,
    password,
    status,
  ]);
  console.log(result.rows);
}

await pgClient.end();
