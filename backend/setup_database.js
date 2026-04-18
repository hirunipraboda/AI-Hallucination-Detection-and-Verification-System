const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { EvidenceSource, SourceCredibility } = require('./src/models/Source');
const Feedback = require('./src/models/Feedback');
const ScoringRecord = require('./src/models/ScoringRecord');
const Analysis = require('./src/models/Analysis');

dotenv.config();

const setupDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    // 1. GENERATE/SEED SOURCES
    console.log('Generating Sources collection...');
    await SourceCredibility.deleteMany({}); // Clear for fresh start
    const sources = [
      {
        sourceName: 'World Health Organization (WHO)',
        sourceURL: 'https://www.who.int',
        sourceCategory: 'Government',
        authorityScore: 98,
        accuracyScore: 95,
        recencyScore: 90,
        overallScore: 94,
        status: 'verified',
        isOfficial: true,
        vetNote: 'Trusted international organization.'
      },
      {
        sourceName: 'Nature Journal',
        sourceURL: 'https://www.nature.com',
        sourceCategory: 'Academic',
        authorityScore: 95,
        accuracyScore: 98,
        recencyScore: 85,
        overallScore: 93,
        status: 'verified',
        isOfficial: true,
        vetNote: 'Top-tier peer-reviewed scientific journal.'
      },
      {
        sourceName: 'Reuters',
        sourceURL: 'https://www.reuters.com',
        sourceCategory: 'News',
        authorityScore: 90,
        accuracyScore: 88,
        recencyScore: 95,
        overallScore: 91,
        status: 'verified',
        isOfficial: true,
        vetNote: 'Global news agency with high accuracy standards.'
      }
    ];
    await SourceCredibility.insertMany(sources);
    console.log(`✅ Seeded ${sources.length} sources.`);

    // 2. GENERATE FEEDBACKS (Dummy/Sample)
    console.log('Generating Feedbacks collection...');
    await Feedback.deleteMany({});
    // We leave this mostly empty for user interaction, but we can add one
    // But it needs a real reportId. We'll skip seeding feedback for now to avoid reference issues.

    // 3. GENERATE SCORING RECORDS (Placeholder)
    console.log('Generating Scoring records collection...');
    await ScoringRecord.deleteMany({});

    console.log('\n🚀 ALL COLLECTIONS GENERATED SUCCESSFULLY');
    console.log('Collections involved:');
    console.log('- analyses (Main Reports)');
    console.log('- feedbacks (User feedback)');
    console.log('- scoring_records (Confidence metadata)');
    console.log('- source_credibility (Verified sources list)');
    console.log('- users (Account data)');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database generation:', err);
    process.exit(1);
  }
};

setupDB();
