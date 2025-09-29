const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { editDetails, getCampaigns, getDetail } = require('../controllers/partnerController');
const { protect, partnerAuth, dashboardAuth } = require('../middleware/auth');

router.patch('/me', protect, partnerAuth, editDetails);
router.get('/campaigns', protect, partnerAuth, getCampaigns);
router.get('/:id', protect, dashboardAuth, getDetail);

module.exports = router;