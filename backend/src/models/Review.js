const mongoose = require('mongoose');

/**
 * Review Model — maps to the 'reviews' collection in MongoDB.
 * This stores user feedback/reviews on AI analysis reports.
 */
const reviewSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // How helpful was the analysis? (1–5)
    voteRating: {
      type: Number,
      min: [1, 'Helpfulness must be at least 1'],
      max: [5, 'Helpfulness must be at most 5'],
      required: [true, 'Helpfulness rating is required'],
    },
    // Overall accuracy rating (1–5)
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      required: [true, 'Rating is required'],
    },
    // Which aspect is the review about?
    category: {
      type: String,
      enum: ['accuracy', 'relevance', 'tone', 'performance', 'others'],
      default: 'accuracy',
    },
    // User's observation / comment
    observation: {
      type: String,
      default: '',
      trim: true,
    },
    // Correction suggestion (only required if helpfulness <= 2)
    correction: {
      type: String,
      default: '',
      trim: true,
    },
    // Admin-managed review status
    status: {
      type: String,
      enum: ['pending', 'applied', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'reviews', // Explicit MongoDB collection name
  }
);

module.exports = mongoose.model('Review', reviewSchema);
