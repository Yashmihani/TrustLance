// src/controllers/userController.js
// Handles profile management

const User   = require('../models/User');
const Review = require('../models/Review');

// GET /api/users/:walletAddress
const getUserByWallet = async (req, res) => {
  try {
    const user = await User.findOne({
      walletAddress: req.params.walletAddress.toLowerCase(),
    }).select('-nonce');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch their reviews too
    const reviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name walletAddress avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, user, reviews });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/profile — update own profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, hourlyRate, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        bio,
        skills,
        hourlyRate,
        role,
        // Mark profile as complete if name is set
        isProfileComplete: !!name,
      },
      { new: true, runValidators: true }
    ).select('-nonce');

    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserByWallet, updateProfile };