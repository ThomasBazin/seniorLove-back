import { pgClient } from '../pgClient.js';
import fs from 'fs';

async function createTables() {
  const query = fs.readFileSync('data/create_tables.sql').toString();

  await pgClient.query(query);
}

await pgClient.connect();

console.log('===> Creating tables...');
await createTables();

await pgClient.end();
