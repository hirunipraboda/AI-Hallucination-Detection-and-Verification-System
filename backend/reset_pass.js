const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const resetPassword = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { dbName: 'truthlens' });
    
    const email = 'hiruniudumulla9@gmail.com';
    const newPassword = 'Password@123'; // Choosing a standard test password
    
    console.log(`Searching for user: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log('User found. Updating password...');
    // We update through the model so the 'pre-save' hook hashes it
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
