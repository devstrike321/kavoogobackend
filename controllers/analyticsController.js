const Campaign = require("../models/campaignSchema");
const Transaction = require("../models/transactionSchema");
const User = require("../models/userSchema");
const Partner = require("../models/partnerSchema");

const getAnalytics = async (req, res) => {
  try {
    const activeCampaigns = await Campaign.countDocuments({
      endDate: { $gte: new Date() },
      status: "Active",
    });
    const completions = await Transaction.aggregate([
      {
        $match: {
          status: "completed", // Match the specific transaction by ID
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
        $group: {
          _id: "$campaign.activityType",
          count: { $sum: 1 },
        },
      },
    ]);
    const userEngagement = await User.find({});
    const totalPartner = await Partner.countDocuments({});
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $subtract: [
              30,
              {
                $dateDiff: {
                  startDate: "$createdAt",
                  endDate: "$$NOW", // Current time at query execution
                  unit: "day", // Returns whole days (floors the result)
                },
              },
            ],
          },
          count: { $sum: 1 }, // Count of users per group (rename from 'i' for clarity)
        },
      },
      {
        $sort: { _id: -1 }, // Optional: Sort by most recent first (e.g., _id: 30 at top)
      },
    ]);
    // Add more analytics as needed

    res.json({
      activeCampaigns,
      completions,
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
