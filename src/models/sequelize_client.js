import 'dotenv/config';

import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.PG_URL, {
  logging: false,
});