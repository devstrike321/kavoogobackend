const express = require('express');
const router = express.Router();
const { getTransactions, exportTransactions } = require('../controllers/transactionController');
const { protect, teamAuth } = require('../middleware/auth');

router.get('/', protect, teamAuth, getTransactions);
router.get('/export', protect, teamAuth, exportTransactions);

module.exports = router;