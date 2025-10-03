const express = require('express');
const router = express.Router();
const { getTransactions, exportTransactions, getTransaction } = require('../controllers/transactionController');
const { protect, teamAuth, dashboardAuth } = require('../middleware/auth');

router.get('/', protect, dashboardAuth, getTransactions);
router.get('/export', protect, teamAuth, exportTransactions);
router.get('/:id', protect, dashboardAuth, getTransaction);

module.exports = router;