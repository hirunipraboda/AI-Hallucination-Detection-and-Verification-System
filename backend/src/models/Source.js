const mongoose = require('mongoose');

const CATEGORIES = [
  'Academic', 'Government', 'News', 'Trusted Web', 
  'Science', 'Technology', 'Healthcare', 'Encyclopedia',
  'Educational', 'NGO', 'Corporate', 'Social Media', 'Other'
];

// ─── Evidence Source: linked to a specific analysis ──────────────────────────
const evidenceSourceSchema = new mongoose.Schema({
  verificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
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
    enum: CATEGORIES,
    default: 'Other',
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

// ─── Source Credibility: the admin-managed source hub ─────────────────────────
const sourceCredibilitySchema = new mongoose.Schema({
  sourceName: {
    type: String,
    required: true,
  },
  sourceURL: {
    type: String,
    required: true,
  },
  sourceCategory: {
    type: String,
    default: 'Other',
    enum: CATEGORIES,
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
  vetNote: {
    type: String,
    default: 'Manual review recommended',
  },
  isOfficial: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Explicit collection names for clarity in MongoDB Atlas
const EvidenceSource = mongoose.model('EvidenceSource', evidenceSourceSchema, 'evidence_sources');
const SourceCredibility = mongoose.model('SourceCredibility', sourceCredibilitySchema, 'sources');

module.exports = { EvidenceSource, SourceCredibility };
