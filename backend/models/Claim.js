const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  responseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
    required: true
  },
  claimText: {
    type: String,
    required: true
  },
  startIndex: Number,
  endIndex: Number,
  claimType: {
    type: String,
    enum: ['factual', 'statistical', 'historical', 'scientific', 'general'],
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'contradicted', 'unverifiable', 'disputed'],
    default: 'pending'
  },
  confidenceLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Claim', claimSchema);
