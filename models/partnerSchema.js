const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Partner = sequelize.define('Partner', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  partnerName: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  industry: { type: DataTypes.STRING },
  contactPerson: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  // campaigns field can be managed via associations in Sequelize
//  campaigns: { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: [] },
  // Add other fields as needed
}, {
  timestamps: true,
});

module.exports = Partner;