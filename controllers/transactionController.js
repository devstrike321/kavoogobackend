const Transaction = require('../models/transactionSchema');
const { Parser } = require('json2csv');

const getTransactions = async (req, res) => {
  const { userId, partnerId, date, campaignId, operator } = req.query;
  let query = {};
  if (userId) query.user = userId;
  if (campaignId) query.campaign = campaignId;
  // Add more filters as needed
  const transactions = await Transaction.find(query).populate('user campaign');
  res.json(transactions);
};

const exportTransactions = async (req, res) => {
  const transactions = await Transaction.find({}).populate('user campaign');
  const fields = ['transactionId', 'date', 'status', 'user.phone', 'campaign.name'];
  const json2csv = new Parser({ fields });
  const csv = json2csv.parse(transactions);
  res.header('Content-Type', 'text/csv');
  res.attachment('transactions.csv');
  res.send(csv);
};

module.exports = { getTransactions, exportTransactions };