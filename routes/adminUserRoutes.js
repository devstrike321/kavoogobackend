const express = require('express');
const router = express.Router();
const {
  login,
  getTeamMembers,
  addTeamMember,
  editTeamMember,
  getPartners,
  getPartner,
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
router.get('/partners/:id', protect, teamAuth, getPartner);
router.patch('/partners/:id', protect, dashboardAuth, editPartner);
router.get('/users', protect, dashboardAuth, getUsers);
router.get('/users/:id', protect, dashboardAuth, getUser);
router.get('/campaigns', protect, teamAuth, getCampaigns);
router.post('/providers', protect, adminAuth, addMobileProvider);
router.patch('/providers/:id', protect, adminAuth, editMobileProvider);
router.get('/providers', protect, adminAuth, getMobileProviders);

module.exports = router;