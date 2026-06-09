// backend/src/controllers/transactionController.js

const Transaction = require('../models/Transaction');
const User        = require('../models/User');

// POST /api/transactions — log a new transaction
const logTransaction = async (req, res) => {
  try {
    const { projectId, from, to, amount, type, txHash, blockNumber } = req.body;

    const transaction = await Transaction.create({
      project:     projectId,
      from:        from.toLowerCase(),
      to:          to.toLowerCase(),
      amount,
      type,
      txHash,
      blockNumber,
    });

    res.status(201).json({ success: true, transaction });

  } catch (error) {
    // Duplicate txHash — already logged
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Transaction already logged',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/transactions/my — get current user's transactions
const getMyTransactions = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress.toLowerCase();

    const transactions = await Transaction.find({
      $or: [
        { from: walletAddress },
        { to:   walletAddress },
      ],
    })
      .populate('project', 'title')
      .sort('-createdAt')
      .limit(50);

    res.json({ success: true, transactions });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { logTransaction, getMyTransactions };