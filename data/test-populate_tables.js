import { pgClient } from './pgClient.js';
import fs from 'fs';

await pgClient.connect();

console.log('===> Creating tables...');
const entireFile = fs.readFileSync('./data/populate_tables.sql').toString();

for (let query of entireFile.split(';')) {
  query += ';';
  await pgClient.query(query);
}

await pgClient.end();
