const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dumpSources = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'truthlens' });
    console.log('Connected to DB:', mongoose.connection.name);
    
    const collectionsToCheck = ['sources', 'sourcecredibilities', 'source_credibilities', 'evidence_sources', 'evidencesources'];
    for (const collName of collectionsToCheck) {
      const count = await mongoose.connection.db.collection(collName).countDocuments();
      console.log(`Collection '${collName}' count: ${count}`);
      if (count > 0) {
        const last = await mongoose.connection.db.collection(collName).find({}).sort({_id:-1}).limit(1).toArray();
        console.log(`Last item in '${collName}':`, last[0].sourceName || last[0].sourceTitle || last[0].name || 'No name field');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dumpSources();
