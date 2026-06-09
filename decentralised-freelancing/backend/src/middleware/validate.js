// src/middleware/validate.js
// Input validation rules for each route
// Uses express-validator to check request body fields

const { body, validationResult } = require('express-validator');

// Run validation and return errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map(e => e.msg),
    });
  }
  next();
};

// Validation rules for creating a project
const projectValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title max 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

  body('budget')
    .isFloat({ min: 0.01 }).withMessage('Budget must be greater than 0'),

  body('category')
    .notEmpty().withMessage('Category is required'),
];

// Validation rules for submitting a proposal
const proposalValidation = [
  body('coverLetter')
    .trim()
    .notEmpty().withMessage('Cover letter is required')
    .isLength({ min: 50 }).withMessage('Cover letter must be at least 50 characters'),

  body('bidAmount')
    .isFloat({ min: 0.01 }).withMessage('Bid amount must be greater than 0'),

  body('deliveryDays')
    .isInt({ min: 1 }).withMessage('Delivery days must be at least 1'),
];

// Validation rules for submitting a review
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .isLength({ max: 1000 }).withMessage('Comment max 1000 characters'),
];

module.exports = { validate, projectValidation, proposalValidation, reviewValidation };