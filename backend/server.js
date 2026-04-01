require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log('--- BACKEND STARTUP ---');
console.log('PORT:', PORT);
console.log('MONGO_URI exists:', !!MONGO_URI);
if (MONGO_URI) console.log('MONGO_URI prefix:', MONGO_URI.split('@')[0]);

// Test Route for Connectivity Check
app.get('/', (req, res) => {
  res.status(200).send('TruthLens Backend is running');
});

const connectDB = async () => {
  console.log('Attempting to connect to MongoDB...');
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'truthlens',
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully to database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Server starting without active DB connection. Data operations may fail.');
  }
};

// Start the server regardless of DB status to prevent "crashes"
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Local Test URI: http://localhost:${PORT}/`);
  connectDB();
});