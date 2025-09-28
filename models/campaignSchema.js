const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
    activityType: { type: String, enum: ['video', 'video_survey', 'survey'] },
    startDate: Date,
    endDate: Date,
    minAge: Number,
    maxAge: Number,
    country: String,
    city: String,
    employmentStatus: String,
    educationLevel: String,
    minSalary: Number,
    maxSalary: Number,
    maritalStatus: String,
    hasKids: Boolean,
    rewardAmount: Number,
    totalBudget: Number,
    costPerUser: Number,
    maxUsers: Number,
    video: { url: String, duration: Number },
    surveyLink: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);