import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

export const pgClient = new Client(process.env.PG_URL);
