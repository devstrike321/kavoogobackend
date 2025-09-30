const AdminUser = require("../models/adminUserSchema");
const Partner = require("../models/partnerSchema");
const User = require("../models/userSchema");
const Campaign = require("../models/campaignSchema");
const MobileProvider = require("../models/mobileProviderSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      const partner = await Partner.findOne({ email });
      if (!partner || !(await bcrypt.compare(password, partner.password))) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
      const token = jwt.sign(
        { id: partner._id, role: "partner" },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      return res.json({ token });
    }
    const token = jwt.sign(
      { id: adminUser._id, role: "adminUser" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getTeamMembers = async(req, res) => {
  try {
    const teamMembers = await AdminUser.find({});
    res.json(teamMembers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

const addTeamMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      country,
      city,
      temporaryPassword,
    } = req.body;
    const existing = await AdminUser.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User exists" });

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(temporaryPassword, salt);

    const teamMember = new AdminUser({
      firstName,
      lastName,
      email,
      phone,
      title,
      country,
      city,
      password,
      role: "team",
    });
    await teamMember.save();
    res.json(teamMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const editTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = Object.keys(req.body);
    const allowed = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "title",
      "country",
      "city",
      "status",
    ];
    const teamMember = await AdminUser.findById(id);
    if (!teamMember || teamMember.role === "admin")
      return res.status(403).json({ msg: "Cannot edit" });
    updates.forEach((update) => {
      if (allowed.includes(update)) teamMember[update] = req.body[update];
    });
    await teamMember.save();
    res.json(teamMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({});
    res.json(partners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const editPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = Object.keys(req.body);
    const allowed = [
      "partnerName",
      "phone",
      "status",
      "industry",
      "contactPerson",
      "email",
    ];
    const partner = await Partner.findById(id);
    if (!partner) return res.status(404).json({ msg: "Partner not found" });
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

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getUser = async(req,res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch(err) {
    console.error(err);
    res.status(500).json({error: "Server error"});
  }
};

const getCampaigns = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "partners", // Collection name (lowercase, plural as per Mongoose default)
          localField: "partner",
          foreignField: "_id",
          as: "partner",
        },
      },
    ];
    const campaigns = await Campaign.aggregate([pipeline]);
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const addMobileProvider = async (req, res) => {
  try {
    console.log(req.body);
    const { balance } = req.body;
    let provider = await MobileProvider.findOne({});
    if(!provider)
      provider = new MobileProvider({ balance });
    else
      provider.balance += Number(balance);
    await provider.save();
    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const editMobileProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = Object.keys(req.body);
    const allowed = ["balance"];
    const provider = await MobileProvider.findById(id);
    if (!provider) return res.status(404).json({ msg: "Provider not found" });
    updates.forEach((update) => {
      if (allowed.includes(update)) provider[update] = req.body[update];
    });
    await provider.save();
    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getMobileProviders = async (req, res) => {
  try {
    const providers = await MobileProvider.find({});
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  login,
  getTeamMembers,
  addTeamMember,
  editTeamMember,
  getPartners,
  editPartner,
  getUsers,
  getUser,
  getCampaigns,
  addMobileProvider,
  editMobileProvider,
  getMobileProviders,
};
