const Partner = require("../models/partnerSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Campaign = require("../models/campaignSchema");

const editDetails = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowed = [
      "partnerName",
      "phone",
      "status",
      "industry",
      "contactPerson",
      "email",
      "country",
    ];
    const partner = req.user;
    updates.forEach((update) => {
      if (allowed.includes(update)) partner[update] = req.body[update];
    });
    await partner.save();
    res.json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getDetail = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
      .select("-password")
      .populate("campaigns");
    res.json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      partner,
      activityType,
      startDate,
      endDate,
      minAge,
      maxAge,
      country,
      city,
      employmentStatus,
      educationLevel,
      minSalary,
      maxSalary,
      maritalStatus,
      hasKids,
      rewardAmount,
      mobileProvider,
      totalBudget,
      costPerUser,
      maxUsers,
      surveyLink,
    } = req.body;

    const campaign = new Campaign({
      name,
      description,
      activityType,
      startDate,
      endDate,
      minAge,
      maxAge,
      country,
      city,
      employmentStatus,
      educationLevel,
      minSalary,
      maxSalary,
      maritalStatus,
      hasKids,
      rewardAmount,
      mobileProvider,
      totalBudget,
      costPerUser,
      maxUsers,
      surveyLink,
      partner,
    });

    if (req.file) {
      campaign.video = { url: req.file.location };
    }

    console.log(partner);
    const curPartner = await Partner.findById(partner);
    if (!curPartner)
      return res.status(404).json({ error: "Partner not found" });

    await campaign.save();
    curPartner.campaigns.push(campaign._id);
    await curPartner.save();
    res.json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ partner: req.user._id });
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { editDetails, createCampaign, getCampaigns, getDetail };
