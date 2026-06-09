// src/controllers/reviewController.js
// Submit and fetch reviews after project completion

const Review  = require('../models/Review');
const Project = require('../models/Project');
const User    = require('../models/User');

// POST /api/reviews — submit a review
const createReview = async (req, res) => {
  try {
    const { projectId, revieweeId, rating, comment } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only review completed projects
    if (project.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed projects',
      });
    }

    const review = await Review.create({
      project:  projectId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment,
    });

    // Recalculate reviewee's reputation score
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      reputationScore: Math.round(avgRating * 10) / 10,
    });

    await review.populate('reviewer', 'name walletAddress avatar');

    res.status(201).json({ success: true, review });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this project',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/user/:userId — get all reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name walletAddress avatar')
      .populate('project',  'title')
      .sort('-createdAt');

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getUserReviews };