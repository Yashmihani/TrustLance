// src/middleware/errorHandler.js
// Central error handler — catches all errors thrown in controllers
// Instead of try/catch everywhere, we just call next(error)

const errorHandler = (err, req, res, next) => {
  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  messages,
    });
  }

  // Mongoose duplicate key error (e.g. same wallet twice)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }

  // Default 500
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;