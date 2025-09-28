const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, teamAuth } = require('../middleware/auth');

router.get('/', protect, teamAuth, getAnalytics);

module.exports = router;