// backend/src/routes/transactionRoutes.js

const express    = require('express');
const router     = express.Router();
const { logTransaction, getMyTransactions } = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');

router.post('/',    authenticate, logTransaction);
router.get('/my',   authenticate, getMyTransactions);

module.exports = router;