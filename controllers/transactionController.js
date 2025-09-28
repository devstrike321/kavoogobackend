const Transaction = require('../models/transactionSchema');
const { Parser } = require('json2csv');

const getTransactions = async (req, res) => {
  const { userId, partnerId, date, campaignId, operator } = req.query;
  let query = {};
  if (userId) query.user = userId;
  if (campaignId) query.campaign = campaignId;
  if (partnerId) query['campaign.partner'] = partnerId;
  // Add more filters as needed

  const pipeline = [
      {
        $lookup: {
          from: 'campaigns', // Collection name (lowercase, plural as per Mongoose default)
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      {
        $lookup: {
          from: 'partners', // Collection name
          let: { partnerIds: '$campaign.partner' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$partnerIds'] }
              }
            }
          ],
          as: 'partners'
        }
      },
      {
        $addFields: {
          campaign: {
            $map: {
              input: '$campaign',
              as: 'c',
              in: {
                $mergeObjects: [
                  '$$c',
                  {
                    partner: {
                      $filter: {
                        input: '$partners',
                        as: 'p',
                        cond: { $eq: ['$$p._id', '$$c.partner'] }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $unset: 'partners'
      }
    ];

    const transactions = await Transaction.aggregate(pipeline);
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