const express = require('express');
const router = express.Router();
// Additional campaign routes if needed beyond user/partner

// For admin to create campaigns
const Campaign = require('../models/campaignSchema');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { protect, dashboardAuth } = require('../middleware/auth');

const { createCampaign } = require('../controllers/partnerController');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    metadata: (req, file) => ({ fieldName: file.fieldname }),
    key: (req, file) => `videos/${Date.now()}_${file.originalname}`,
  }),
});

router.post('/', protect, dashboardAuth, upload.single('video'), createCampaign);

module.exports = router;