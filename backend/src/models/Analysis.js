const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalResponse: {
      type: String,
      required: true,
      trim: true,
    },
    // Updated to structured format
    extractedClaims: [
      {
        text: String,
        sentence: String,
        type: {
          type: String,
          enum: ['factual', 'statistical', 'historical', 'general'],
          default: 'general',
        },
        confidence: {
          type: Number,
          default: 0,
        },
      },
    ],
    // Updated to structured format with reasons
    flaggedSentences: [
      {
        text: String,
        reasons: [String],
        isProvenFalse: {
          type: Boolean,
          default: false,
        },
      },
    ],
    attributedSources: [
      {
        name: String,
        url: String,
        category: String,
        score: Number,
      },
    ],
    // Legacy support (to avoid breaking old code during migration if needed)
    suspiciousSentences: {
      type: [String],
      default: [],
    },
    issues: {
      unsupportedClaims: {
        type: Number,
        default: 0,
      },
      overconfidentStatements: {
        type: Number,
        default: 0,
      },
      contradictions: {
        type: Number,
        default: 0,
      },
    },
    score: {
      type: Number,
      default: 0,
    },
    confidenceScoreRaw: {
      type: Number,
      default: 0.1,
    },
    confidenceReasons: {
      type: [String],
      default: [],
    },
    confidenceLevel: {
      type: String,
      enum: ['LOW', 'MID', 'HIGH'],
      default: 'LOW',
    },
    notes: {
      type: String,
      default: '',
    },
    metadata: {
      responseLength: {
        type: Number,
        default: 0,
      },
      claimCount: {
        type: Number,
        default: 0,
      },
      userIP: String,
      sourceType: {
        type: String,
        default: 'manual-input',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analysis', AnalysisSchema, 'analyses');