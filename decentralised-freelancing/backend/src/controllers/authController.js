// backend/src/controllers/authController.js
const jwt    = require('jsonwebtoken');
const ethers = require('ethers');
const User   = require('../models/User');

// ── GET NONCE ─────────────────────────────────────────────────────────────
// GET /api/auth/nonce/:walletAddress
// Returns a nonce message for the wallet to sign

const getNonce = async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase().trim();

    console.log('getNonce called for:', walletAddress);

    // Validate wallet address format
    if (!walletAddress || walletAddress.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address',
      });
    }

    // Find existing user or create new one
    let user = await User.findOne({ walletAddress });

    if (!user) {
      console.log('Creating new user for:', walletAddress);
      user = await User.create({ walletAddress });
    }

    // Make sure nonce exists and is valid
    if (!user.nonce || user.nonce === null || user.nonce === undefined) {
      user.nonce = Math.floor(Math.random() * 1000000).toString();
      await user.save();
    }

    const message = 'Sign this message to log in to DecentWork: ' + user.nonce;

    console.log('Nonce generated:', user.nonce);
    console.log('Message:', message);

    return res.json({
      success: true,
      nonce:   user.nonce,
      message: message,
    });

  } catch (error) {
    console.error('getNonce error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── VERIFY SIGNATURE ──────────────────────────────────────────────────────
// POST /api/auth/verify
// Verifies the signed message and returns JWT token

const verifySignature = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    console.log('verifySignature called for:', walletAddress);

    // Validate inputs
    if (!walletAddress || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address and signature are required',
      });
    }

    if (typeof signature !== 'string' || signature.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature format',
      });
    }

    const address = walletAddress.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ walletAddress: address });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please try connecting again.',
      });
    }

    // Make sure nonce exists
    if (!user.nonce) {
      return res.status(400).json({
        success: false,
        message: 'Nonce not found. Please try connecting again.',
      });
    }

    // Reconstruct the exact message that was signed
    const message = 'Sign this message to log in to DecentWork: ' + user.nonce;

    console.log('Verifying message:', message);
    console.log('Signature:', signature.slice(0, 20) + '...');

    // Recover the address that signed the message
    let recoveredAddress;
    try {
      // ethers v6 syntax
      recoveredAddress = ethers.verifyMessage(message, signature);
      console.log('Recovered address:', recoveredAddress);
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Signature verification failed',
      });
    }

    // Compare addresses
    if (recoveredAddress.toLowerCase() !== address) {
      console.error('Address mismatch:', recoveredAddress, '!=', address);
      return res.status(401).json({
        success: false,
        message: 'Invalid signature. Authentication failed.',
      });
    }

    // Rotate nonce after successful login — prevents replay attacks
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id:            user._id,
        walletAddress: user.walletAddress,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('Authentication successful for:', address);

    return res.json({
      success: true,
      token,
      user: {
        id:                user._id,
        walletAddress:     user.walletAddress,
        name:              user.name              || '',
        role:              user.role              || 'both',
        isProfileComplete: user.isProfileComplete || false,
        reputationScore:   user.reputationScore   || 0,
        avatar:            user.avatar            || '',
      },
    });

  } catch (error) {
    console.error('verifySignature error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Authentication failed',
    });
  }
};

// ── GET ME ────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns current logged in user from JWT token

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-nonce');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user: {
        id:                user._id,
        walletAddress:     user.walletAddress,
        name:              user.name              || '',
        role:              user.role              || 'both',
        isProfileComplete: user.isProfileComplete || false,
        reputationScore:   user.reputationScore   || 0,
        avatar:            user.avatar            || '',
        skills:            user.skills            || [],
        bio:               user.bio               || '',
        hourlyRate:        user.hourlyRate         || 0,
        completedJobs:     user.completedJobs      || 0,
      },
    });

  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getNonce, verifySignature, getMe };