const Transaction = require("../models/transactionSchema");
const { Parser } = require("json2csv");
const mongoose = require("mongoose");

const getTransactions = async (req, res) => {
  try {
    const { userId, partnerId, date, campaignId, operator } = req.query;
    let query = {};
    if (userId) query.user = userId;
    if (campaignId) query.campaign = campaignId;
    if (partnerId) query["campaign.partner"] = partnerId;
    // Add more filters as needed

    const pipeline = [
      {
        $lookup: {
          from: "campaigns", // Collection name (lowercase, plural as per Mongoose default)
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
        },
      },
      {
        $lookup: {
          from: "partners", // Collection name
          let: { partnerIds: "$campaign.partner" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$partnerIds"] },
              },
            },
          ],
          as: "partners",
        },
      },
      {
        $addFields: {
          campaign: {
            $map: {
              input: "$campaign",
              as: "c",
              in: {
                $mergeObjects: [
                  "$$c",
                  {
                    partner: {
                      $filter: {
                        input: "$partners",
                        as: "p",
                        cond: { $eq: ["$$p._id", "$$c.partner"] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: "partners",
      },
    ];

    const transactions = await Transaction.aggregate(pipeline);
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getTransaction = async (req, res) => {
  try {
    const id = req.params.id;

    console.log(id);
    // Add more filters as needed

    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id), // Match the specific transaction by ID
        },
      },
      {
        $lookup: {
          from: "campaigns", // Collection name (lowercase, plural as per Mongoose default)
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
        },
      },
      {
        $unwind: {
          path: "$campaign",
          preserveNullAndEmptyArrays: true, // Handle cases where no campaign is found
        },
      },
      {
        $lookup: {
          from: "partners", // Collection name
          let: { partnerId: "$campaign.partner" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$partnerId"] },
              },
            },
          ],
          as: "partner",
        },
      },
      {
        $unwind: {
          path: "$partner",
          preserveNullAndEmptyArrays: true, // Handle cases where no partner is found
        },
      },
      {
        $addFields: {
          "campaign.partner": "$partner", // Embed the partner object directly into campaign
        },
      },
      {
        $unset: ["partner"], // Clean up the temporary partner field
      },
    ];

    const transaction = (await Transaction.aggregate(pipeline))[0];
    console.log(transaction);
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).populate("user campaign");
    const fields = [
      "transactionId",
      "date",
      "status",
      "user.phone",
      "campaign.name",
    ];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(transactions);
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getTransaction, getTransactions, exportTransactions };
