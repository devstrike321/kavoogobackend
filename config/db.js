// db.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // only loads .env locally
}

const { Sequelize } = require('sequelize');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URI;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
});

module.exports = sequelize;