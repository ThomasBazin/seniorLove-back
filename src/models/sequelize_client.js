import 'dotenv/config';

import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.PG_URL, {
  logging: false,
  define: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

sequelize.authenticate();
