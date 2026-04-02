const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const migrate = async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { dbName: 'truthlens' });
  console.log('Connected.');

  const db = mongoose.connection.db;
  const collection = db.collection('analyses');

  console.log('Renaming originalText to originalResponse in all documents...');
  const result = await collection.updateMany(
    { originalText: { $exists: true } },
    { $rename: { "originalText": "originalResponse" } }
  );

  console.log(`Matched ${result.matchedCount} and modified ${result.modifiedCount} documents.`);
  process.exit(0);
};

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
