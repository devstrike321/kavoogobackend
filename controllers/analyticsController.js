const { Campaign, Transaction, User, Partner } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

const getAnalytics = async (req, res) => {
  try {
    console.log("Fetching analytics data...");
    // Active campaigns (endDate >= now and status = 'Active')
    const activeCampaigns = await Campaign.count({
      where: {
        endDate: { [Op.gte]: new Date() },
        status: "Active",
      },
    });

    // Transaction completions grouped by campaign activityType
    const completions = await Transaction.findAll({
      where: { status: "completed" },
      include: [{
        model: Campaign
      }],
    });

    // Group completions by activityType
    const completionCounts = {};
    completions.forEach(tx => {
      const type = tx.Campaign ? tx.Campaign.activityType : "Unknown";
      completionCounts[type] = (completionCounts[type] || 0) + 1;
    });

    // User engagement: all users
    const userEngagement = await User.findAll();

    // Total partners
    const totalPartner = await Partner.count();

    // User growth in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Group by day
    const userGrowthRaw = await User.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      group: [literal('date')],
      order: [[literal('date'), 'DESC']],
      raw: true,
    });

    // Format userGrowth as array of { date, count }
    const userGrowth = userGrowthRaw.map(row => ({
      date: row.date,
      count: parseInt(row.count, 10),
    }));

    res.json({
      activeCampaigns,
      completions: completionCounts,
      userEngagement,
      totalPartner,
      userGrowth,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getAnalytics };