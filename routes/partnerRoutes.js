const express = require('express');
const router = express.Router();
const multer = require('multer');
const { editDetails, getCampaigns, getDetail } = require('../controllers/partnerController');
const { protect, partnerAuth, dashboardAuth } = require('../middleware/auth');

router.patch('/me', protect, partnerAuth, editDetails);
router.get('/campaigns', protect, partnerAuth, getCampaigns);
router.get('/:id', protect, dashboardAuth, getDetail);

module.exports = router;