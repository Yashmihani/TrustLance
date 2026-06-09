// src/routes/reviewRoutes.js
const express = require('express');
const router  = express.Router();
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { authenticate }                 = require('../middleware/auth');
const { reviewValidation, validate }   = require('../middleware/validate');

router.post('/',              authenticate, reviewValidation, validate, createReview);
router.get('/user/:userId',   getUserReviews);

module.exports = router;