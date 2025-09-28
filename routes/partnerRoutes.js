const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { login, editDetails, createCampaign, getCampaigns } = require('../controllers/partnerController');
const { protect, partnerAuth } = require('../middleware/auth');

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

router.patch('/me', protect, partnerAuth, editDetails);
router.post('/campaigns', protect, partnerAuth, upload.single('video'), createCampaign);
router.get('/campaigns', protect, partnerAuth, getCampaigns);

module.exports = router;