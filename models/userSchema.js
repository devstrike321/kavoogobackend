const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  phone: { type: DataTypes.STRING, unique: true, allowNull: false },
  otp: { type: DataTypes.STRING },
  firstName: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  gender: { type: DataTypes.STRING },
  dateOfBirth: { type: DataTypes.DATE },
  country: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  employmentStatus: { type: DataTypes.STRING, defaultValue: 'employed' },
  educationLevel: { type: DataTypes.STRING },
  maritalStatus: { type: DataTypes.STRING },
  hasKids: { type: DataTypes.STRING, defaultValue: 'no' },
  salaryRangeMin: { type: DataTypes.FLOAT },
  salaryRangeMax: { type: DataTypes.FLOAT },
  hasBankAccount: { type: DataTypes.BOOLEAN },
  rewards: { type: DataTypes.INTEGER, defaultValue: 0 },
  referralCode: { type: DataTypes.STRING, unique: true },
  referredBy: { type: DataTypes.INTEGER, references: { model: 'Users', key: 'id' } },
//  transactions: { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: [] },
}, {
  timestamps: true,
});

module.exports = User;