// src/middleware/auth.js
// Verifies the JWT token on every protected route
// If token is missing or invalid → 401 Unauthorized

const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please connect your wallet.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request object
    // Every controller can now access req.user
    const user = await User.findById(decoded.id).select('-nonce');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    req.user = user;
    next(); // pass to the next handler

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please reconnect your wallet.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

module.exports = { authenticate };