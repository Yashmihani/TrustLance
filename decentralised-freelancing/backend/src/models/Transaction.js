// src/models/Transaction.js
// Logs every on-chain payment event for dashboard history

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Project',
    },

    // The wallet that sent the transaction
    from: {
      type:     String,
      required: true,
      lowercase: true,
    },

    // The wallet that received it
    to: {
      type:     String,
      required: true,
      lowercase: true,
    },

    // Amount in MATIC
    amount: {
      type:     Number,
      required: true,
    },

    // Type of transaction
    type: {
      type:    String,
      enum:    ['deposit', 'release', 'refund', 'dispute'],
      required: true,
    },

    // The blockchain transaction hash
    txHash: {
      type:   String,
      unique: true,
    },

    // Block number for verification
    blockNumber: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);