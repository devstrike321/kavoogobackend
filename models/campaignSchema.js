const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Campaign = sequelize.define('Campaign', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  partnerId: { type: DataTypes.INTEGER, allowNull: false },
  activityType: { type: DataTypes.ENUM('Video', 'Video_survey', 'Survey'), allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'InActive'), defaultValue: 'Active' },
  endDate: { type: DataTypes.DATE },
  minAge: { type: DataTypes.INTEGER },
  maxAge: { type: DataTypes.INTEGER },
  country: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  employmentStatus: { type: DataTypes.STRING },
  educationLevel: { type: DataTypes.STRING },
  minSalary: { type: DataTypes.INTEGER },
  maxSalary: { type: DataTypes.INTEGER },
  maritalStatus: { type: DataTypes.STRING },
  hasKids: { type: DataTypes.BOOLEAN },
  rewardAmount: { type: DataTypes.FLOAT, allowNull: false },
  totalBudget: { type: DataTypes.FLOAT },
  costPerUser: { type: DataTypes.FLOAT },
  maxUsers: { type: DataTypes.INTEGER },
  videoUrl: { type: DataTypes.STRING },
  videoDuration: { type: DataTypes.INTEGER }, // in seconds
  surveyLink: { type: DataTypes.STRING },
  // Add other fields as needed
}, {
  timestamps: true,
});

module.exports = Campaign;