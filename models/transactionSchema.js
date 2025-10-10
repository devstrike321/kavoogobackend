const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const shortid = require('shortid');

const Transaction = sequelize.define('Transaction', {
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => `TXN-${new Date().toISOString().slice(0, 10)}-${shortid.generate()}`,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('completed', 'pending', 'failed'),
    allowNull: false,
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Foreign keys can be added later for User and Campaign
  // Add other fields as needed
}, {
  timestamps: true,
});

module.exports = Transaction;