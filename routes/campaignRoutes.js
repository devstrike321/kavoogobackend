const express = require('express');
const router = express.Router();
const path = require('path');
const { Partner } = require('../models');
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

const upload1 = multer({
  storage: multer.diskStorage({
    destination: (req,file,cb) => {
      cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
})

router.get('/:id', protect, dashboardAuth, async (req, res) => {
  console.log(req.params.id);
  const campaigns = await Campaign.findByPk(
    req.params.id,
    { include: [{ model: Partner }] }
  );
  if (!campaigns) return res.status(404).json({ error: 'Campaign not found' });
  console.log(campaigns);
  res.json(campaigns);
});
router.post('/', protect, dashboardAuth, upload1.single('video'), createCampaign);

module.exports = router;