import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
let config;
if (process.env.NODE_ENV === 'development') {
  config = process.env.PG_URL;
} else if (process.env.NODE_ENV === 'production') {
  config = {
    connectionString: process.env.PG_URL,
    // Beware! The ssl object is overwritten when parsing the connectionString
    ssl: {
      rejectUnauthorized: true,
    },
  };
}

export const pgClient = new Client(config);
