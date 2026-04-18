const ScoringRecord = require('../models/ScoringRecord');
const {
  buildScoringRecordPayload,
  calculateConfidenceScore,
  mapRiskLevel,
} = require('../services/scoringService');

function handleError(res, error, statusCode = 400) {
  return res.status(statusCode).json({
    data: null,
    error: error.message || error,
  });
}

exports.createScoringRecord = async (req, res) => {
  try {
    const { responseId, verificationScore, credibilityScore, consensusScore, weights } = req.body;
    
    if (!responseId) {
       return handleError(res, new Error('responseId is required'));
    }

    const payload = buildScoringRecordPayload({
        responseId,
        verificationScore: verificationScore || 0,
        credibilityScore: credibilityScore || 0,
        consensusScore: consensusScore || 0,
        weights
    });

    const record = await ScoringRecord.create(payload);

    return res.status(201).json({
      data: record,
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
};

exports.getScoringByResponseId = async (req, res) => {
  try {
    const { responseId } = req.params;

    const record = await ScoringRecord.findOne({
      responseId,
      isDeleted: false,
    }).lean();

    if (!record) {
      return res.status(200).json({ data: null, message: 'Scoring record not found' });
    }

    return res.json({
      data: record,
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
};

exports.recalculateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationScore, credibilityScore, consensusScore, weights } = req.body;

    const existing = await ScoringRecord.findById(id);

    if (!existing || existing.isDeleted) {
      return handleError(res, new Error('Scoring record not found'), 404);
    }

    const vScore = verificationScore ?? existing.scoringFactors.verificationScore;
    const crScore = credibilityScore ?? existing.scoringFactors.credibilityScore;
    const coScore = consensusScore ?? existing.scoringFactors.consensusScore;

    const newWeights = weights || {
      verification: existing.scoringFactors.weightDistribution.verificationWeight,
      credibility: existing.scoringFactors.weightDistribution.credibilityWeight,
      consensus: existing.scoringFactors.weightDistribution.consensusWeight,
    };

    const confidenceScore = calculateConfidenceScore({
      verificationScore: vScore,
      credibilityScore: crScore,
      consensusScore: coScore,
      weights: newWeights,
    });

    const hallucinationRiskLevel = mapRiskLevel(confidenceScore);
    const calculatedAt = new Date();

    existing.confidenceScore = confidenceScore;
    existing.hallucinationRiskLevel = hallucinationRiskLevel;
    existing.scoringFactors.verificationScore = vScore;
    existing.scoringFactors.credibilityScore = crScore;
    existing.scoringFactors.consensusScore = coScore;
    existing.scoringFactors.weightDistribution.verificationWeight = newWeights.verification;
    existing.scoringFactors.weightDistribution.credibilityWeight = newWeights.credibility;
    existing.scoringFactors.weightDistribution.consensusWeight = newWeights.consensus;
    existing.calculatedAt = calculatedAt;

    await existing.save();

    return res.json({
      data: existing,
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
};

exports.deleteScoringRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await ScoringRecord.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!record) {
      return handleError(res, new Error('Scoring record not found'), 404);
    }

    return res.json({
      data: record,
      error: null,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
};
