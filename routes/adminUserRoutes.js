const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminUserController');
const { protect, adminAuth, teamAuth } = require('../middleware/auth');

router.post('/login', login);
router.post('/team', protect, adminAuth, addTeamMember);
router.patch('/team/:id', protect, adminAuth, editTeamMember);
router.get('/partners', protect, teamAuth, getPartners);
router.patch('/partners/:id', protect, teamAuth, editPartner);
router.get('/users', protect, teamAuth, getUsers);
router.get('/campaigns', protect, teamAuth, getCampaigns);
router.post('/providers', protect, adminAuth, addMobileProvider);
router.patch('/providers/:id', protect, adminAuth, editMobileProvider);
router.get('/providers', protect, teamAuth, getMobileProviders);

module.exports = router;