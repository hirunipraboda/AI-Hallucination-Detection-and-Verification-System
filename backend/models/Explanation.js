const mongoose = require('mongoose');

const explanationSchema = new mongoose.Schema({
  responseId: {
    type: String,
    required: [true, 'Response ID is required'],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  originalText: {
    type: String,
    required: true
  },
  // Store original inputs to enable update/regenerate via PUT later
  claimsInput: { type: Array, default: [] },
  verificationResultsInput: { type: Array, default: [] },
  scoresInput: { type: Object, default: {} },
  annotatedText: [{
    sentenceId: { type: Number, required: true },
    text: { type: String, required: true },
    highlightColor: {
      type: String,
      enum: ['green', 'yellow', 'red'],
      default: 'yellow',
      required: true
    },
    explanation: { type: String, default: '' },
    hasDetails: { type: Boolean, default: false },
    claimId: { type: String },
    startIndex: Number,
    endIndex: Number
  }],
  sourceReferences: [{
    claimId: { type: String },
    claimText: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ['verified', 'contradicted', 'unverifiable', 'disputed'],
      required: true
    },
    summary: String,
    sources: [{
      sourceId: { type: String },
      name: { type: String, required: true },
      credibility: { type: Number, min: 0, max: 100, required: true },
      url: String,
      evidence: String,
      publicationDate: Date,
      accessedDate: { type: Date, default: Date.now },
      category: String
    }]
  }],
  scoreBreakdown: {
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    hallucinationRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    factorsBreakdown: [{
      factorName: {
        type: String,
        enum: ['Verification Rate', 'Source Credibility', 'Source Consensus', 'Claim Specificity'],
        required: true
      },
      weight: { type: Number, required: true },
      value: { type: Number, required: true },
      contribution: { type: Number, required: true },
      description: String
    }]
  },
  userInteractions: {
    expandedSections: { type: [String], default: [] },
    tappedSentences: { type: [Number], default: [] },
    exported: { type: Boolean, default: false },
    lastViewed: Date,
    timeSpent: Number
  },
  metadata: {
    totalSentences: Number,
    verifiedCount: Number,
    contradictedCount: Number,
    unverifiableCount: Number,
    disputedCount: Number,
    averageSourceCredibility: Number,
    processingTime: Number
  },
  version: { type: Number, default: 1 },
  isArchived: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

explanationSchema.index({ createdAt: -1 });
explanationSchema.index({ 'scoreBreakdown.confidenceScore': 1 });
explanationSchema.index({ 'scoreBreakdown.hallucinationRisk': 1 });
explanationSchema.index({ isArchived: 1 });

explanationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

explanationSchema.methods.getSummary = function() {
  return {
    id: this._id,
    responseId: this.responseId,
    date: this.formattedDate,
    originalPreview: (this.originalText || '').slice(0, 50),
    confidenceScore: this.scoreBreakdown.confidenceScore,
    riskLevel: this.scoreBreakdown.hallucinationRisk,
    totalSentences: this.annotatedText.length,
    verifiedCount: this.annotatedText.filter(s => s.highlightColor === 'green').length,
    needsContextCount: this.annotatedText.filter(s => s.highlightColor === 'yellow').length,
    contradictedCount: this.annotatedText.filter(s => s.highlightColor === 'red').length
  };
};

module.exports = mongoose.model('Explanation', explanationSchema);
