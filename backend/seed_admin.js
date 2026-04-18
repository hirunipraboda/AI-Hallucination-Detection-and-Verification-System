const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB.');

    const adminEmail = 'admin@truthlens.com'; // We'll use this as the "username" (email)
    const adminPassword = 'admin@123';

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log('Admin already exists. Updating password/role...');
      admin.password = adminPassword;
      admin.role = 'admin';
      await admin.save();
    } else {
      console.log('Creating new admin...');
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
    }

    console.log('✅ Admin user ready!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
