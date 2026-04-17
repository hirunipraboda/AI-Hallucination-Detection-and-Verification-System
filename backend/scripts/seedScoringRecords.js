require('dotenv').config();

const mongoose = require('mongoose');
const ScoringRecord = require('../src/models/ScoringRecord');
const { buildScoringRecordPayload } = require('../src/services/scoringService');

function parseArgs(argv) {
  const args = {
    count: 40,
    reset: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--reset') {
      args.reset = true;
    } else if (token === '--count') {
      const next = argv[i + 1];
      if (next) {
        const n = Number(next);
        if (!Number.isNaN(n) && n > 0) args.count = Math.floor(n);
        i += 1;
      }
    }
  }

  return args;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 3) {
  const n = Math.random() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeResponseId() {
  const prefixes = ['ai_response', 'chat_completion', 'eval_run', 'assistant_out', 'model_reply'];
  const yyyy = new Date().getFullYear();
  const mm = String(randomInt(1, 12)).padStart(2, '0');
  const dd = String(randomInt(1, 28)).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${sample(prefixes)}_${yyyy}${mm}${dd}_${suffix}`;
}

function randomWeights() {
  // Keep verification generally dominant, but vary slightly.
  const verification = randomFloat(0.45, 0.65, 3);
  const credibility = randomFloat(0.20, 0.40, 3);
  const consensus = randomFloat(0.10, 0.30, 3);
  return { verification, credibility, consensus };
}

function randomScores() {
  // Production-like spread: most scores mid-high, some risky lows.
  const profile = Math.random();

  if (profile < 0.15) {
    return {
      verificationScore: randomInt(10, 45),
      credibilityScore: randomInt(10, 55),
      consensusScore: randomInt(10, 60),
    };
  }

  if (profile < 0.55) {
    return {
      verificationScore: randomInt(45, 85),
      credibilityScore: randomInt(40, 85),
      consensusScore: randomInt(35, 80),
    };
  }

  return {
    verificationScore: randomInt(70, 98),
    credibilityScore: randomInt(65, 98),
    consensusScore: randomInt(55, 95),
  };
}

function randomCalculatedAt() {
  const now = Date.now();
  const daysBack = randomInt(0, 30);
  const msBack = daysBack * 24 * 60 * 60 * 1000 + randomInt(0, 6 * 60 * 60 * 1000);
  return new Date(now - msBack);
}

async function main() {
  const { count, reset } = parseArgs(process.argv.slice(2));
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined. Set it in backend/.env before seeding.');
  }

  await mongoose.connect(mongoUri);

  try {
    if (reset) {
      await ScoringRecord.deleteMany({});
    }

    const docs = Array.from({ length: count }).map(() => {
      const responseId = makeResponseId();
      const scores = randomScores();
      const weights = randomWeights();
      const payload = buildScoringRecordPayload({
        responseId,
        ...scores,
        weights,
      });

      payload.calculatedAt = randomCalculatedAt();
      return payload;
    });

    const inserted = await ScoringRecord.insertMany(docs);

    // eslint-disable-next-line no-console
    console.log(
      `Seeded ${inserted.length} scoring records${reset ? ' (reset collection first)' : ''}.`
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

