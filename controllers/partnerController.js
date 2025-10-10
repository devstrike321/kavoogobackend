const { Partner, Campaign } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    const partner = await Partner.findByPk(req.params.id, {
      include: { model: Campaign }
    });
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
      totalBudget,
      costPerUser,
      maxUsers,
      surveyLink,
    } = req.body;

    const campaignData = {
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
      totalBudget,
      costPerUser,
      maxUsers,
      surveyLink,
      partnerId: partner,
      status: endDate < new Date() ? "InActive" : "Active",
    };

    if (req.file) {
      campaignData.videoUrl = req.file.path;
    }

    const curPartner = await Partner.findByPk(partner);
    if (!curPartner)
      return res.status(404).json({ error: "Partner not found" });

    const campaign = await Campaign.create(campaignData);
    res.json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({ where: { partnerId: req.user.id } });
    for (const camp of campaigns) {
      if (camp.endDate < new Date()) {
        camp.status = "InActive";
        await camp.save();
      }
    }
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { editDetails, getDetail, createCampaign, getCampaigns };