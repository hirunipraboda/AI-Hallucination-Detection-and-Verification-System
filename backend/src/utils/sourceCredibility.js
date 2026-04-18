const clampScore = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
};

const calculateOverallScore = ({ authorityScore, accuracyScore, recencyScore }) => {
  const a = clampScore(authorityScore);
  const b = clampScore(accuracyScore);
  const c = clampScore(recencyScore);
  return Math.round((a + b + c) / 3);
};

const deriveStatus = (overallScore) => {
  if (overallScore >= 70) return 'verified';
  if (overallScore >= 40) return 'unverified';
  return 'unreliable';
};

const isValidHttpUrl = (value) => {
  const str = String(value || '').trim();
  return /^https?:\/\/\S+$/i.test(str);
};

module.exports = {
  clampScore,
  calculateOverallScore,
  deriveStatus,
  isValidHttpUrl,
};
