const { Transaction, User, Campaign, Partner } = require("../models");
const { Parser } = require("json2csv");
const { Op } = require("sequelize");

const getTransactions = async (req, res) => {
  try {
    const { userId, partnerId, campaignId } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (campaignId) where.campaignId = campaignId;

    let include = [
      {
        model: User,
      },
      {
        model: Campaign,
        include: [{ model: Partner }],
      },
    ];

    const transactions = await Transaction.findAll({ where, include });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getTransaction = async (req, res) => {
  try {
    const id = req.params.id;
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
        },
        {
          model: Campaign,
          include: [{ model: Partner }],
        },
      ],
    });
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: User },
        { model: Campaign }, // FIXED: use name
      ],
    });
    const data = transactions.map((tx) => ({
      transactionId: tx.id,
      date: tx.createdAt,
      status: tx.status,
      userPhone: tx.User ? tx.User.phone : "",
      campaignName: tx.Campaign ? tx.Campaign.name : "",
    }));
    const fields = [
      "transactionId",
      "date",
      "status",
      "userPhone",
      "campaignName",
    ];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(data);
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getTransaction, getTransactions, exportTransactions };
