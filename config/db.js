// config/db.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load .env in non-production environments
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Ensure DATABASE_URL exists
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ No DATABASE_URL found.');
  process.exit(1);
}

// Create Sequelize instance
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  ssl: true, // Ensures SSL is used
  dialectOptions: {
    ssl: {
      require: true,           // Must be true for DigitalOcean
      rejectUnauthorized: false // Accept self-signed certificate
    }
  },
  define: {
    freezeTableName: true, // optional, keeps table names as-is
    timestamps: false,     // optional, disable automatic timestamps
  },
});

// Test connection immediately (optional, for logs)
sequelize
  .authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

module.exports = sequelize;
