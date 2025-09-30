const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminUserController');
const { protect, adminAuth, teamAuth, dashboardAuth } = require('../middleware/auth');

router.post('/login', login);
router.get('/team', protect, adminAuth, getTeamMembers);
router.post('/team', protect, adminAuth, addTeamMember);
router.patch('/team/:id', protect, adminAuth, editTeamMember);
router.get('/partners', protect, teamAuth, getPartners);
router.patch('/partners/:id', protect, teamAuth, editPartner);
router.get('/users', protect, teamAuth, getUsers);
router.get('/users/:id', protect, dashboardAuth, getUser);
router.get('/campaigns', protect, teamAuth, getCampaigns);
router.post('/providers', protect, adminAuth, addMobileProvider);
router.patch('/providers/:id', protect, adminAuth, editMobileProvider);
router.get('/providers', protect, adminAuth, getMobileProviders);

module.exports = router;