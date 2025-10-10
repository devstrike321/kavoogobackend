const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MobileProvider = sequelize.define('MobileProvider', {
  balance: { type: DataTypes.INTEGER, defaultValue: 0 },
  // Add other fields as needed
}, {
  timestamps: true,
});

module.exports = MobileProvider;