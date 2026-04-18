const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');

const checkUsers = async () => {
  try {
    console.log('--- DB CHECK START ---');
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is undefined in .env');
        process.exit(1);
    }
    console.log('URI loaded, connecting...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    
    console.log('Querying users...');
    const users = await User.find({});
    console.log('Query completed.');
    console.log('Total users found:', users.length);
    
    users.forEach((u, i) => {
        console.log(`${i+1}. NAME: ${u.name} | EMAIL: ${u.email}`);
    });
    
    console.log('--- DB CHECK END ---');
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    process.exit(1);
  }
};

checkUsers();
