const {
  calculateConfidenceScore,
  mapRiskLevel,
} = require('../src/services/scoringService');

describe('scoringService', () => {
  test('calculates confidence score with default weights', () => {
    const score = calculateConfidenceScore({
      verificationScore: 80,
      credibilityScore: 70,
      consensusScore: 60,
    });

    expect(score).toBe(73);
  });

  test('maps risk levels correctly', () => {
    expect(mapRiskLevel(75)).toBe('Low');
    expect(mapRiskLevel(55)).toBe('Medium');
    expect(mapRiskLevel(30)).toBe('High');
  });
});

