// backend/src/models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // Notification type
    type: {
      type:    String,
      enum:    [
        'proposal_received',   // client gets this when freelancer applies
        'proposal_accepted',   // freelancer gets this when hired
        'proposal_rejected',   // freelancer gets this when rejected
        'escrow_created',      // freelancer gets this when escrow deployed
        'payment_deposited',   // freelancer gets this when funds locked
        'payment_released',    // freelancer gets this when paid
        'payment_refunded',    // client gets this when refunded
        'dispute_raised',      // both get this when dispute filed
        'review_received',     // user gets this when reviewed
      ],
      required: true,
    },

    // Human-readable title
    title: {
      type:     String,
      required: true,
    },

    // Full message
    message: {
      type:     String,
      required: true,
    },

    // Link to relevant page
    link: {
      type:    String,
      default: '',
    },

    // Has user seen this?
    isRead: {
      type:    Boolean,
      default: false,
    },

    // Optional reference data
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Project',
    },
  },
  { timestamps: true }
);

// Index for fast queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);