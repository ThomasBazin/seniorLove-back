import { pgClient } from './pgClient.js';
import { Scrypt } from '../src/auth/Scrypt.js';
import users from './users_data_70.json' with { type: 'json' }; //if assert does not work replace it with "with"

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

const adminName = 'admin';
const adminEmail = 'admin1@seniorlove.com';
const adminPassword = Scrypt.hash('adminpass123');
const query = `INSERT INTO administrators (name, email, password)
        VALUES ($1,$2,$3) RETURNING *`;
const result = await pgClient.query(query, [
  adminName,
  adminEmail,
  adminPassword,
]);
console.log(result.rows);

await pgClient.end();
