const mongoose = require('mongoose');

const WeightDistributionSchema = new mongoose.Schema(
  {
    verificationWeight: { type: Number, required: true },
    credibilityWeight: { type: Number, required: true },
    consensusWeight: { type: Number, required: true },
  },
  { _id: false }
);

const ScoringFactorsSchema = new mongoose.Schema(
  {
    verificationScore: { type: Number, min: 0, max: 100, required: true },
    credibilityScore: { type: Number, min: 0, max: 100, required: true },
    consensusScore: { type: Number, min: 0, max: 100, required: true },
    weightDistribution: { type: WeightDistributionSchema, required: true },
  },
  { _id: false }
);

const ScoringRecordSchema = new mongoose.Schema(
  {
    responseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true, index: true },
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    hallucinationRiskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    scoringFactors: { type: ScoringFactorsSchema, required: true },
    calculatedAt: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ScoringRecord', ScoringRecordSchema);
