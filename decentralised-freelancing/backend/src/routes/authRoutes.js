// src/routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const { getNonce, verifySignature, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.get('/nonce/:walletAddress', getNonce);
router.post('/verify',             verifySignature);
router.get('/me',   authenticate,  getMe);

module.exports = router;