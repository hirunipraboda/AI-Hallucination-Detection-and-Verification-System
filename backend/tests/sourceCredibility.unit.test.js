const assert = require('assert');
const {
  clampScore,
  calculateOverallScore,
  deriveStatus,
  isValidHttpUrl,
} = require('../utils/sourceCredibility');

// Simple dependency-free unit test runner for evidence.
// Run: node backend/tests/sourceCredibility.unit.test.js

// clampScore
assert.strictEqual(clampScore(-10), 0);
assert.strictEqual(clampScore(101), 100);
assert.strictEqual(clampScore('50'), 50);
assert.strictEqual(clampScore('not-a-number'), 0);

// calculateOverallScore (average)
assert.strictEqual(
  calculateOverallScore({ authorityScore: 80, accuracyScore: 70, recencyScore: 60 }),
  Math.round((80 + 70 + 60) / 3)
);

// deriveStatus thresholds
assert.strictEqual(deriveStatus(70), 'verified');
assert.strictEqual(deriveStatus(69), 'unverified');
assert.strictEqual(deriveStatus(40), 'unverified');
assert.strictEqual(deriveStatus(39), 'unreliable');
assert.strictEqual(deriveStatus(0), 'unreliable');

// isValidHttpUrl allowlist + rejects risky schemes
assert.strictEqual(isValidHttpUrl('https://example.com'), true);
assert.strictEqual(isValidHttpUrl('http://example.com'), true);
assert.strictEqual(isValidHttpUrl('ftp://example.com'), false);
assert.strictEqual(isValidHttpUrl('javascript:alert(1)'), false);
assert.strictEqual(isValidHttpUrl('   https://example.com  '), true);

console.log('✅ sourceCredibility unit tests passed');

