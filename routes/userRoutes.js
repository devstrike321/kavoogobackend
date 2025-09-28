const express = require('express');
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  onboardProfile,
  editProfile,
  getProfile,
  getCampaigns,
  getCampaignDetail,
  submitCampaign,
  transferMoney,
} = require('../controllers/userController');
const { protect, userAuth } = require('../middleware/auth');

router.post('/otp', requestOTP);
router.post('/verify', verifyOTP);
router.patch('/onboard', protect, userAuth, onboardProfile);
router.patch('/', protect, userAuth, editProfile);
router.get('/me', protect, userAuth, getProfile);
router.get('/campaigns', protect, userAuth, getCampaigns);
router.get('/campaigns/:id', protect, userAuth, getCampaignDetail);
router.post('/submit', protect, userAuth, submitCampaign);
router.post('/transfer', protect, userAuth, transferMoney);

module.exports = router;