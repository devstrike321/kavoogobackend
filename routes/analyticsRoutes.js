const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, dashboardAuth } = require('../middleware/auth');

router.get('/', protect, dashboardAuth, getAnalytics);

module.exports = router;