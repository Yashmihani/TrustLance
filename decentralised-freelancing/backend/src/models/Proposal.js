// src/models/Proposal.js
// A freelancer's application to a project

const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    // Which project this proposal is for
    project: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Project',
      required: true,
    },

    // Who submitted this proposal
    freelancer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // Cover letter / pitch
    coverLetter: {
      type:      String,
      required:  true,
      maxlength: 2000,
    },

    // Proposed amount in MATIC
    bidAmount: {
      type:     Number,
      required: true,
      min:      0,
    },

    // Estimated days to complete
    deliveryDays: {
      type:     Number,
      required: true,
      min:      1,
    },

    // Status of this proposal
    status: {
      type:    String,
      enum:    ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// One freelancer can only submit one proposal per project
proposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);