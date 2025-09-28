const Partner = require('../models/partnerSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Campaign = require('../models/campaignSchema');


const editDetails = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ['partnerName', 'phone', 'status', 'industry', 'contactPerson', 'email'];
  const partner = req.user;
  updates.forEach(update => {
    if (allowed.includes(update)) partner[update] = req.body[update];
  });
  await partner.save();
  res.json(partner);
};

const createCampaign = async (req, res) => {
  const {
    name, description, partner, activityType, startDate, endDate,
    minAge, maxAge, country, city, employmentStatus, educationLevel,
    minSalary, maxSalary, maritalStatus, hasKids, rewardAmount,
    mobileProvider, totalBudget, costPerUser, maxUsers, surveyLink, videoDuration
  } = req.body;

  const campaign = new Campaign({
    name, description, activityType, startDate, endDate,
    minAge, maxAge, country, city, employmentStatus, educationLevel,
    minSalary, maxSalary, maritalStatus, hasKids, rewardAmount,
    mobileProvider, totalBudget, costPerUser, maxUsers, surveyLink,
    partner,
  });

  if (req.file) {
    campaign.video = { url: req.file.location, duration: videoDuration };
  }

  const curPartner = await Partner.findById(partner);
  if (!curPartner) return res.status(404).json({ error: 'Partner not found' });

  await campaign.save();
  req.curPartner.campaigns.push(campaign._id);
  await req.curPartner.save();
  res.json(campaign);
};

const getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ partner: req.user._id });
  res.json(campaigns);
};

module.exports = { editDetails, createCampaign, getCampaigns };