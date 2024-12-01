import { pgClient } from '../pgClient.js';
import fs from 'fs';

async function populateTables() {
  const entireFile = fs.readFileSync('data/populate_tables.sql').toString();

  for (let query of entireFile.split(';')) {
    query += ';';
    await pgClient.query(query);
  }
}

await pgClient.connect();

console.log('===> Seeding tables...');
await populateTables();

await pgClient.end();
