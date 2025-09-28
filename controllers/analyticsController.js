const Campaign = require('../models/campaignSchema');
const Transaction = require('../models/transactionSchema');
const User = require('../models/userSchema');

const getAnalytics = async (req, res) => {
  const activeCampaigns = await Campaign.countDocuments({ endDate: { $gte: new Date() } });
  const completions = await Transaction.countDocuments({ status: 'completed' });
  const userEngagement = await User.aggregate([
    { $lookup: { from: 'transactions', localField: 'transactions', foreignField: '_id', as: 'trans' } },
    { $group: { _id: '$employmentStatus', count: { $sum: 1 }, completions: { $sum: { $size: '$trans' } } } },
  ]);
  // Add more analytics as needed

  res.json({
    activeCampaigns,
    completions,
    userEngagement,
  });
};

module.exports = { getAnalytics };