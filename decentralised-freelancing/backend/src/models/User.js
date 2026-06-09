// src/models/User.js
// Represents both clients and freelancers
// Wallet address is the unique identifier — no email/password

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Wallet address — primary identifier (lowercase for consistency)
    walletAddress: {
      type:     String,
      required: true,
      unique:   true,
      lowercase: true,
      trim:     true,
    },

    // Display name (set after first login)
    name: {
      type:    String,
      trim:    true,
      default: '',
    },

    // User can be client, freelancer, or both
    role: {
      type:    String,
      enum:    ['client', 'freelancer', 'both'],
      default: 'both',
    },

    // Profile details
    bio: {
      type:    String,
      maxlength: 500,
      default: '',
    },

    // Skills list e.g. ['Solidity', 'React', 'Web3']
    skills: [{ type: String, trim: true }],

    // Profile picture — IPFS hash (added in Step 14)
    avatar: {
      type:    String,
      default: '',
    },

    // Hourly rate in MATIC
    hourlyRate: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // Nonce for wallet signature auth
    // Changes after every login for security
    nonce: {
      type:    String,
      default: () => Math.floor(Math.random() * 1000000).toString(),
    },

    // Reputation score (0-5) calculated from reviews
    reputationScore: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },

    // Total number of completed jobs
    completedJobs: {
      type:    Number,
      default: 0,
    },

    // Is profile complete?
    isProfileComplete: {
      type:    Boolean,
      default: false,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Virtual: short wallet display (0x1234...5678)
userSchema.virtual('shortAddress').get(function () {
  return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
});

module.exports = mongoose.model('User', userSchema);