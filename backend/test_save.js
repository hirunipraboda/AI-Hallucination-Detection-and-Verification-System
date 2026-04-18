const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { SourceCredibility, EvidenceSource } = require('./src/models/Source');
dotenv.config();

const testSave = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'truthlens' });
    console.log('Connected to DB.');

    const timestamp = new Date().toISOString();
    const sourceName = `Test Source ${timestamp}`;
    
    console.log('Attempting to save SourceCredibility...');
    const sc = new SourceCredibility({
      sourceName,
      sourceURL: 'https://test.com/' + Date.now(),
      sourceCategory: 'Other',
      authorityScore: 80,
      accuracyScore: 80,
      recencyScore: 80,
      overallScore: 80,
      status: 'verified',
      isOfficial: true
    });
    
    const savedSc = await sc.save();
    console.log('✅ SourceCredibility saved:', savedSc._id);

    console.log('Attempting to save EvidenceSource...');
    const es = new EvidenceSource({
      sourceTitle: sourceName,
      sourceURL: 'https://test.com/' + Date.now(),
      sourceCategory: 'Other',
      credibilityScore: 80
    });
    
    await es.save();
    console.log('✅ EvidenceSource saved.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Save failed:', err);
    process.exit(1);
  }
};

testSave();
