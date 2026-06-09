// src/routes/proposalRoutes.js
const express = require('express');
const router  = express.Router();
const {
  createProposal, acceptProposal,
  rejectProposal, getMyProposals,
} = require('../controllers/proposalController');
const { authenticate }                          = require('../middleware/auth');
const { proposalValidation, validate }          = require('../middleware/validate');

router.post('/',          authenticate, proposalValidation, validate, createProposal);
router.get('/my',         authenticate, getMyProposals);
router.put('/:id/accept', authenticate, acceptProposal);
router.put('/:id/reject', authenticate, rejectProposal);

module.exports = router;