const { User, Campaign, Transaction } = require("../models");
const jwt = require("jsonwebtoken");
const shortid = require("shortid");
const twilio = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);
const { getSurveyResponse } = require("../services/");
const { Op } = require("sequelize");

const requestOTP = async (req, res) => {
  try {
    const { phone, referralCode } = req.body;
    if (!phone) return res.status(400).json({ msg: "Phone required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let user = await User.findOne({ where: { phone } });

    if (!user) {
      user = await User.create({ phone, referralCode: shortid.generate() });
      if (referralCode) {
        const referrer = await User.findOne({ where: { referralCode } });
        if (referrer) user.referredBy = referrer.id;
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
      res.json({ msg: "OTP sent" , otp: otp  /* Remove this line in production */   });
    } catch (err) {
      res.json({ msg: "Sending OTP failed" , otp: otp , error: err.msg /* Remove this line in production */  }); /* Remove this line in production */
      // res.status(500).json({ msg: "Failed to send OTP" }); --- IGNORE ---
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user || user.otp !== otp)
      return res.status(400).json({ msg: "Invalid OTP" });

    user.otp = null;
    await user.save();

    if (user.referredBy) {
      const referrer = await User.findByPk(user.referredBy);
      const bonus = 5;
      if (referrer) {
        referrer.rewards += bonus;
        await referrer.save();
      }
    }

    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const onboardProfile = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, country, city } = req.body;
    const user = req.user;
    user.firstName = firstName;
    user.lastName = lastName;
    user.dateOfBirth = dateOfBirth;
    user.country = country;
    user.city = city;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const editProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowed = [
      "firstName",
      "lastName",
      "email",
      "gender",
      "dateOfBirth",
      "country",
      "city",
      "employmentStatus",
      "educationLevel",
      "maritalStatus",
      "hasKids",
      "salaryRangeMin",
      "salaryRangeMax",
      "hasBankAccount",
    ];
    const user = req.user;
    updates.forEach((update) => {
      if (allowed.includes(update)) user[update] = req.body[update];
    });
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const user = req.user;
    if (!user.dateOfBirth)
      return res.status(400).json({ msg: "Complete profile first" });

    const age =
      new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
    const activeCampaigns = await Campaign.findAll({
      where: {
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
      },
    });

    const matched = activeCampaigns.filter((c) => {
      if (c.minAge && (age < c.minAge || age > c.maxAge || !c.maxAge))
        return false;
      if (c.country && c.country !== user.country) return false;
      if (c.city && c.city !== user.city) return false;
      if (c.employmentStatus && c.employmentStatus !== user.employmentStatus)
        return false;
      if (c.educationLevel && c.educationLevel !== user.educationLevel)
        return false;
      if (c.maritalStatus && c.maritalStatus !== user.maritalStatus)
        return false;
      if (c.hasKids !== undefined && c.hasKids !== user.hasKids) return false;
      if (
        c.minSalary &&
        (user.salaryRangeMin < c.minSalary ||
          user.salaryRangeMax > c.maxSalary ||
          !c.maxSalary)
      )
        return false;
      return true;
    });

    res.json(matched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getCampaignDetail = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ msg: "Campaign not found" });
    res.json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const submitCampaign = async (req, res) => {
  try {
    const { campaignId, watchedDuration, surveyResponseId } = req.body;
    const user = req.user;
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) return res.status(404).json({ msg: "Campaign not found" });

    let verified = true;
    let status = "completed";

    if (
      campaign.activityType.includes("video") &&
      watchedDuration < (campaign.videoDuration * 0.9 || 0)
    ) {
      verified = false;
    }

    if (campaign.activityType.includes("survey") && surveyResponseId) {
      const formId = campaign.surveyLink.split("/").pop();
      const completed = await getSurveyResponse(
        formId,
        surveyResponseId,
        process.env.TRIPETTO_API_KEY
      );
      if (!completed) verified = false;
    }

    if (!verified) status = "failed";

    const transaction = await Transaction.create({
      status,
      campaignId: campaign.id,
      userId: user.id,
    });

    if (status === "completed") {
      //send Cash reward.
      const success = true; // Placeholder for actual transfer logic
      // In real implementation, integrate with payment gateway here
      if (success) {
        user.rewards += campaign.rewardAmount;
        await user.save();
      } else {
        transaction.status = "pending";
        await transaction.save();
      }
    }

    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const transferMoney = async (userId, amount) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.hasBankAccount)
      throw new Error("User not eligible for transfer");

    // Integrate with payment gateway to transfer money to user's bank account
    const success = true; // Placeholder

    if (success) {
      user.rewards -= amount;
      await user.save();
      return true;
    } else {
      throw new Error("Transfer failed");
    }
  } catch (err) {
    console.error(err);
    return false;
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