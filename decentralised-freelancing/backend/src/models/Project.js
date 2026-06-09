// src/models/Project.js
// A job posted by a client

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    // Who posted this project
    client: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',   // references User model
      required: true,
    },

    // Who was hired (set when client accepts a proposal)
    freelancer: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    title: {
      type:      String,
      required:  true,
      trim:      true,
      maxlength: 100,
    },

    description: {
      type:      String,
      required:  true,
      maxlength: 5000,
    },

    category: {
      type:     String,
      required: true,
      enum: [
        'Web Development', 'Mobile Development', 'Smart Contract',
        'UI/UX Design', 'Content Writing', 'Data Science', 'DevOps', 'Other',
      ],
    },

    // Required skills e.g. ['Solidity', 'React']
    skills: [{ type: String }],

    // Budget in MATIC
    budget: {
      type:     Number,
      required: true,
      min:      0,
    },

    // Project lifecycle status
    status: {
      type:    String,
      enum:    ['open', 'in_progress', 'completed', 'cancelled', 'disputed'],
      default: 'open',
    },

    // Deadline date
    deadline: {
      type: Date,
    },

    // On-chain escrow contract address (set in Step 9)
    escrowAddress: {
      type:    String,
      default: null,
    },

    // On-chain transaction hash when escrow was created
    escrowTxHash: {
      type:    String,
      default: null,
    },

    // IPFS attachments (added in Step 14)
    attachments: [{ type: String }],

    // Number of proposals received
    proposalCount: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for fast queries
projectSchema.index({ status: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ category: 1 });

module.exports = mongoose.model('Project', projectSchema);