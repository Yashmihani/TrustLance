// src/models/Review.js
// Rating left after a project is completed

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Project',
      required: true,
    },

    // Who wrote the review
    reviewer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // Who is being reviewed
    reviewee: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // 1 to 5 stars
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5,
    },

    comment: {
      type:      String,
      maxlength: 1000,
      default:   '',
    },
  },
  { timestamps: true }
);

// One review per project per reviewer
reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);