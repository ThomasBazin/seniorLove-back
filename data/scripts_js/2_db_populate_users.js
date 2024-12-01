import 'dotenv/config';
import { pgClient } from '../pgClient.js';
import { Scrypt } from '../../src/auth/Scrypt.js';
import users from '../users_data_70.json' with { type: 'json' }; //if assert does not work replace it with "with"

async function populateUsers() {
  for (const user of users) {
    const {
      name,
      birth_date: birth,
      description,
      gender,
      picture,
      email,
      status,
    } = user;
    const password = Scrypt.hash(user.password);

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

  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = Scrypt.hash(process.env.ADMIN_PASSWORD);
  const query = `INSERT INTO administrators (name, email, password)
          VALUES ($1,$2,$3) RETURNING *`;
  const result = await pgClient.query(query, [
    adminName,
    adminEmail,
    adminPassword,
  ]);
  console.log(result.rows);
}

await pgClient.connect();

console.log('===> Seeding users...');
await populateUsers();

await pgClient.end();
