const AdminUser = require('../models/adminUserSchema');
const Partner = require('../models/partnerSchema');
const User = require('../models/userSchema');
const Campaign = require('../models/campaignSchema');
const MobileProvider = require('../models/mobileProviderSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  const adminUser = await AdminUser.findOne({ email });
  if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: adminUser._id, role: 'adminUser' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
};

const addTeamMember = async (req, res) => {
  const { firstName, lastName, email, phone, title, country, city, temporaryPassword } = req.body;
  const existing = await AdminUser.findOne({ email });
  if (existing) return res.status(400).json({ msg: 'User exists' });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(temporaryPassword, salt);

  const teamMember = new AdminUser({
    firstName, lastName, email, phone, title, country, city, password, role: 'team'
  });
  await teamMember.save();
  res.json(teamMember);
};

const editTeamMember = async (req, res) => {
  const { id } = req.params;
  const updates = Object.keys(req.body);
  const allowed = ['firstName', 'lastName', 'email', 'phone', 'title', 'country', 'city', 'status'];
  const teamMember = await AdminUser.findById(id);
  if (!teamMember || teamMember.role === 'admin') return res.status(403).json({ msg: 'Cannot edit' });
  updates.forEach(update => {
    if (allowed.includes(update)) teamMember[update] = req.body[update];
  });
  await teamMember.save();
  res.json(teamMember);
};

const getPartners = async (req, res) => {
  const partners = await Partner.find({});
  res.json(partners);
};

const editPartner = async (req, res) => {
  const { id } = req.params;
  const updates = Object.keys(req.body);
  const allowed = ['partnerName', 'phone', 'status', 'industry', 'contactPerson', 'email'];
  const partner = await Partner.findById(id);
  if (!partner) return res.status(404).json({ msg: 'Partner not found' });
  updates.forEach(update => {
    if (allowed.includes(update)) partner[update] = req.body[update];
  });
  await partner.save();
  res.json(partner);
};

const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

const getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({});
  res.json(campaigns);
};

const addMobileProvider = async (req, res) => {
  const { balance } = req.body;
  const provider = new MobileProvider({ balance });
  await provider.save();
  res.json(provider);
};

const editMobileProvider = async (req, res) => {
  const { id } = req.params;
  const updates = Object.keys(req.body);
  const allowed = ['balance'];
  const provider = await MobileProvider.findById(id);
  if (!provider) return res.status(404).json({ msg: 'Provider not found' });
  updates.forEach(update => {
    if (allowed.includes(update)) provider[update] = req.body[update];
  });
  await provider.save();
  res.json(provider);
};

const getMobileProviders = async (req, res) => {
  const providers = await MobileProvider.find({});
  res.json(providers);
};

module.exports = {
  login,
  addTeamMember,
  editTeamMember,
  getPartners,
  editPartner,
  getUsers,
  getCampaigns,
  addMobileProvider,
  editMobileProvider,
  getMobileProviders,
};