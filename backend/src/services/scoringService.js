const DEFAULT_WEIGHTS = {
  verification: 0.5,
  credibility: 0.3,
  consensus: 0.2,
};

function normalizeWeights(weights) {
  const {
    verification = DEFAULT_WEIGHTS.verification,
    credibility = DEFAULT_WEIGHTS.credibility,
    consensus = DEFAULT_WEIGHTS.consensus,
  } = weights || {};

  const total = verification + credibility + consensus || 1;

  return {
    verification: verification / total,
    credibility: credibility / total,
    consensus: consensus / total,
  };
}

function calculateConfidenceScore({
  verificationScore,
  credibilityScore,
  consensusScore,
  weights = DEFAULT_WEIGHTS,
}) {
  const normalized = normalizeWeights(weights);

  const score =
    verificationScore * normalized.verification +
    credibilityScore * normalized.credibility +
    consensusScore * normalized.consensus;

  return Math.round(score);
}

function mapRiskLevel(confidenceScore) {
  if (confidenceScore >= 70) return 'Low';
  if (confidenceScore >= 40) return 'Medium';
  return 'High';
}

function buildScoringRecordPayload(input) {
  const {
    responseId,
    verificationScore,
    credibilityScore,
    consensusScore,
    weights,
  } = input;

  const normalizedWeights = normalizeWeights(weights || DEFAULT_WEIGHTS);

  const confidenceScore = calculateConfidenceScore({
    verificationScore,
    credibilityScore,
    consensusScore,
    weights: normalizedWeights,
  });

  const hallucinationRiskLevel = mapRiskLevel(confidenceScore);

  const calculatedAt = new Date();

  return {
    responseId,
    confidenceScore,
    hallucinationRiskLevel,
    scoringFactors: {
      verificationScore,
      credibilityScore,
      consensusScore,
      weightDistribution: {
        verificationWeight: normalizedWeights.verification,
        credibilityWeight: normalizedWeights.credibility,
        consensusWeight: normalizedWeights.consensus,
      },
    },
    calculatedAt,
  };
}

module.exports = {
  DEFAULT_WEIGHTS,
  normalizeWeights,
  calculateConfidenceScore,
  mapRiskLevel,
  buildScoringRecordPayload,
};
