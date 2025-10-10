const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdminUser = sequelize.define('AdminUser', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('admin', 'team'), defaultValue: 'team' },
  phone: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  firstName: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  // Add other fields as needed
}, {
  timestamps: true,
});

module.exports = AdminUser;