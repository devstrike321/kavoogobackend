const express = require('express');
const router = express.Router();
const { protect, teamAuth } = require('../middleware/auth');
// Additional campaign routes if needed beyond user/partner

// For admin to create campaigns
const Campaign = require('../models/campaignSchema');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

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

const createCampaignAdmin = async (req, res) => {
  // Similar to partner create, but select partner
  const { partnerId, ...rest } = req.body;
  const campaign = new Campaign({ ...rest, partner: partnerId });
  if (req.file) {
    campaign.video = { url: req.file.location, duration: rest.videoDuration };
  }
  await campaign.save();
  res.json(campaign);
};

router.post('/', protect, teamAuth, upload.single('video'), createCampaignAdmin);

module.exports = router;