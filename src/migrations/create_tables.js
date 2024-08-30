import { sequelize } from '../models/index.js';

console.log('Deleting existing tables...');
await sequelize.drop({ cascade: true });

console.log('Creating new tables...');
await sequelize.sync();

console.log('Migration is OK!...');
await sequelize.close();
