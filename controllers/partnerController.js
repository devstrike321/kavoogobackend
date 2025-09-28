const Partner = require('../models/partnerSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Campaign = require('../models/campaignSchema');

const login = async (req, res) => {
  const { email, password } = req.body;
  const partner = await Partner.findOne({ email });
  if (!partner || !(await bcrypt.compare(password, partner.password))) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: partner._id, role: 'partner' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
};

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
    name, description, activityType, startDate, endDate,
    minAge, maxAge, country, city, employmentStatus, educationLevel,
    minSalary, maxSalary, maritalStatus, hasKids, rewardAmount,
    mobileProvider, totalBudget, costPerUser, maxUsers, surveyLink, videoDuration
  } = req.body;

  const campaign = new Campaign({
    name, description, activityType, startDate, endDate,
    minAge, maxAge, country, city, employmentStatus, educationLevel,
    minSalary, maxSalary, maritalStatus, hasKids, rewardAmount,
    mobileProvider, totalBudget, costPerUser, maxUsers, surveyLink,
    partner: req.user._id,
  });

  if (req.file) {
    campaign.video = { url: req.file.location, duration: videoDuration };
  }

  await campaign.save();
  req.user.campaigns.push(campaign._id);
  await req.user.save();
  res.json(campaign);
};

const getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ partner: req.user._id });
  res.json(campaigns);
};

module.exports = { login, editDetails, createCampaign, getCampaigns };