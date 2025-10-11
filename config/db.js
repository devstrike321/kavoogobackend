// db.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in non-production environments only 

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // only loads .env locally
}

const { Sequelize } = require('sequelize');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URI;

if (!connectionString) {
  console.error('❌ No database connection string found. Set DATABASE_URL or POSTGRES_URI.');
  // Optionally throw to fail fast:
  // throw new Error('No database connection string found. Set DATABASE_URL or POSTGRES_URI.');
}

const isProd = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: isProd
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

module.exports = sequelize;