const {
  AdminUser,
  Partner,
  User,
  Campaign,
  MobileProvider,
  Transaction,
} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// Admin/Partner login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let adminUser = await AdminUser.findOne({ where: { email } });
    if (adminUser && (await bcrypt.compare(password, adminUser.password))) {
      const token = jwt.sign(
        { id: adminUser.id, role: "adminUser" },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      return res.json({ token });
    }
    let partner = await Partner.findOne({ where: { email } });
    if (partner && (await bcrypt.compare(password, partner.password))) {
      const token = jwt.sign(
        { id: partner.id, role: "partner" },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      return res.json({ token });
    }
    return res.status(400).json({ msg: "Invalid credentials" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all team members
const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await AdminUser.findAll();
    res.json(teamMembers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add a team member
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
    const existing = await AdminUser.findOne({ where: { email } });
    if (existing) return res.status(400).json({ msg: "User exists" });

    const password = await bcrypt.hash(temporaryPassword, 10);

    const teamMember = await AdminUser.create({
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
    res.json(teamMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Edit a team member
const editTeamMember = async (req, res) => {
  try {
    const id  = req.params.id;
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
    const teamMember = await AdminUser.findByPk(id);
    if (!teamMember || teamMember.role === "admin")
      return res.status(403).json({ msg: "Cannot edit" });

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) teamMember[field] = req.body[field];
    });
    await teamMember.save();
    res.json(teamMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getTeamMember = async (req, res) => {
  try {
    const teamMember = await AdminUser.findByPk(req.params.id);
    if (!teamMember) return res.status(404).json({ msg: "Not found" });
    res.json(teamMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// Get all partners with campaigns
const getPartners = async (req, res) => {
  try {
    const partners = await Partner.findAll({
      include: {
        model: Campaign,
        as: "Campaigns",
        order: [["updatedAt", "DESC"]],
      },
    });
    res.json(partners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Edit a partner
const editPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      "partnerName",
      "phone",
      "status",
      "industry",
      "country",
      "contactPerson",
      "email",
    ];
    const partner = await Partner.findByPk(id);
    if (!partner) return res.status(404).json({ msg: "Partner not found" });

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) partner[field] = req.body[field];
    });
    await partner.save();
    res.json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single partner
const getPartner = async (req, res) => {
  try {
    const partner = await Partner.findByPk(req.params.id);
    res.json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all users with transactions and campaigns
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Transaction,
        include: {
          model: Campaign,
        },
        order: [["updatedAt", "DESC"]],
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single user
const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Transaction , include: [{ model: Campaign, include:[{ model: Partner}] }] }],
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all campaigns and update status if ended
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({include:[{ model: Partner }]});
    for (const camp of campaigns) {
      if (camp.endDate && camp.endDate < new Date()) {
        camp.status = "InActive";
        await camp.save();
      }
    }
    const campaignsWithPartner = await Campaign.findAll({
      include: {
        model: Partner,
      },
    });
    res.json(campaignsWithPartner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add mobile provider balance
const addMobileProvider = async (req, res) => {
  try {
    const { balance } = req.body;
    let provider = await MobileProvider.findOne();
    if (!provider) {
      provider = await MobileProvider.create({ balance });
    } else {
      provider.balance += Number(balance);
      await provider.save();
    }
    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Edit mobile provider balance
const editMobileProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await MobileProvider.findByPk(id);
    if (!provider) return res.status(404).json({ msg: "Provider not found" });
    if (req.body.balance !== undefined) provider.balance = req.body.balance;
    await provider.save();
    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all mobile providers
const getMobileProviders = async (req, res) => {
  try {
    const providers = await MobileProvider.findAll();
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
  getTeamMember,
  editTeamMember,
  getPartners,
  editPartner,
  getPartner,
  getUsers,
  getUser,
  getCampaigns,
  addMobileProvider,
  editMobileProvider,
  getMobileProviders,
};
