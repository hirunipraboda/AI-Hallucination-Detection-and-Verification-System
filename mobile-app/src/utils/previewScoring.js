export const DEFAULT_WEIGHTS = {
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

export function calculateConfidenceScore({
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

export function mapRiskLevel(confidenceScore) {
  if (confidenceScore >= 70) return 'Low';
  if (confidenceScore >= 40) return 'Medium';
  return 'High';
}

