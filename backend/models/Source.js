const mongoose = require('mongoose');

// 💡 This matches your team's evidence_sources collection
const evidenceSourceSchema = new mongoose.Schema({
  verificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'verification_results',
    default: null,
  },
  sourceTitle: {
    type: String,
    required: true,
  },
  sourceURL: {
    type: String,
    required: true,
  },
  sourceCategory: {
    type: String,
    required: true,
    enum: ['Academic', 'Government', 'Trusted Web', 'News', 'Other'],
  },
  credibilityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// 💡 This matches your team's source_credibility collection
const sourceCredibilitySchema = new mongoose.Schema({
  sourceName: {
    type: String,
    required: true,
  },
  authorityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  accuracyScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  recencyScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  overallScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['verified', 'unverified', 'unreliable'],
    default: 'unverified',
  },
}, { timestamps: true });

const EvidenceSource = mongoose.model('evidence_sources', evidenceSourceSchema);
const SourceCredibility = mongoose.model('source_credibility', sourceCredibilitySchema);

module.exports = { EvidenceSource, SourceCredibility };