const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
const Campaign = require('../models/campaignSchema');
const Transaction = require('../models/transactionSchema');
const { sendAirtime, getSurveyResponse } = require('../services/');

const requestOTP = async (req, res) => {
  const { phone, referralCode } = req.body;
  if (!phone) return res.status(400).json({ msg: 'Phone required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  let user = await User.findOne({ phone });

  if (!user) {
    user = new User({ phone });
    user.referralCode = shortid.generate();
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) user.referredBy = referrer._id;
    }
  }
  user.otp = otp;
  await user.save();

  try {
    await twilio.messages.create({
      body: `Your Kavoo GO OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
    res.json({ msg: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone });
  if (!user || user.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });

  user.otp = undefined;
  await user.save();

  if (user.referredBy) {
    const referrer = await User.findById(user.referredBy);
    const bonus = 5; // Configurable bonus amount
    referrer.rewards += bonus;
    await referrer.save();
    // Optionally send bonus airtime to referrer
    // But spec credits directly on completion, so add to rewards only
  }

  const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
};

const onboardProfile = async (req, res) => {
  const { firstName, lastName, dateOfBirth, country, city } = req.body;
  const user = req.user;
  user.firstName = firstName;
  user.lastName = lastName;
  user.dateOfBirth = dateOfBirth;
  user.country = country;
  user.city = city;
  await user.save();
  res.json(user);
};

const editProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = [
    'firstName', 'lastName', 'email', 'gender', 'dateOfBirth', 'country', 'city',
    'employmentStatus', 'educationLevel', 'maritalStatus', 'hasKids',
    'salaryRangeMin', 'salaryRangeMax', 'hasBankAccount'
  ];
  const user = req.user;
  updates.forEach(update => {
    if (allowed.includes(update)) user[update] = req.body[update];
  });
  await user.save();
  res.json(user);
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const getCampaigns = async (req, res) => {
  const user = req.user;
  if (!user.dateOfBirth) return res.status(400).json({ msg: 'Complete profile first' });

  const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
  const activeCampaigns = await Campaign.find({
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  const matched = activeCampaigns.filter(c => {
    if (c.minAge && (age < c.minAge || age > c.maxAge || !c.maxAge)) return false;
    if (c.country && c.country !== user.country) return false;
    if (c.city && c.city !== user.city) return false;
    if (c.employmentStatus && c.employmentStatus !== user.employmentStatus) return false;
    if (c.educationLevel && c.educationLevel !== user.educationLevel) return false;
    if (c.maritalStatus && c.maritalStatus !== user.maritalStatus) return false;
    if (c.hasKids !== undefined && c.hasKids !== user.hasKids) return false;
    if (c.minSalary && (user.salaryRangeMin < c.minSalary || user.salaryRangeMax > c.maxSalary || !c.maxSalary)) return false;
    return true;
  });

  res.json(matched);
};

const getCampaignDetail = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  res.json(campaign);
};

const submitCampaign = async (req, res) => {
  const { campaignId, watchedDuration, surveyResponseId } = req.body;
  const user = req.user;
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

  let verified = true;
  let status = 'completed';

  if (campaign.activityType.includes('video') && watchedDuration < (campaign.video?.duration * 0.9 || 0)) {
    verified = false;
  }

  if (campaign.activityType.includes('survey') && surveyResponseId) {
    const formId = campaign.surveyLink.split('/').pop(); // Assume last part is formId
    const completed = await getSurveyResponse(formId, surveyResponseId, process.env.TRIPETTO_API_KEY);
    if (!completed) verified = false;
  }

  if (!verified) status = 'failed';

  const transaction = new Transaction({
    status,
    campaign: campaign._id,
    user: user._id,
  });
  await transaction.save();

  if (status === 'completed') {
    const success = await sendAirtime(user.phone, campaign.rewardAmount);
    if (success) {
      user.rewards += campaign.rewardAmount;
    } else {
      transaction.status = 'pending';
      await transaction.save();
    }
  }

  user.transactions.push(transaction._id);
  await user.save();

  res.json(transaction);
};

const transferMoney = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user || !user.hasBankAccount) throw new Error('User not eligible for transfer');

  // Integrate with payment gateway to transfer money to user's bank account
  // This is a placeholder for actual implementation
  const success = true; // Assume transfer is successful

  if (success) {
    user.rewards -= amount;
    await user.save();
    return true;
  } else {
    throw new Error('Transfer failed');
  }
};

module.exports = {
  requestOTP,
  verifyOTP,
  onboardProfile,
  editProfile,
  getProfile,
  getCampaigns,
  getCampaignDetail,
  submitCampaign,
  transferMoney,
};