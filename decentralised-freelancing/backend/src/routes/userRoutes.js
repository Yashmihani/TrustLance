// src/routes/userRoutes.js
const express = require('express');
const router  = express.Router();
const { getUserByWallet, updateProfile } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/:walletAddress',         getUserByWallet);
router.put('/profile', authenticate,  updateProfile);

module.exports = router;