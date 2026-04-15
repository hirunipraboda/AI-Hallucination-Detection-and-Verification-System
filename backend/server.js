const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes (only explanation routes now)
const explanationRoutes = require('./routes/explanationRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (for development)
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<')) {
  console.error('Missing/invalid MONGODB_URI in .env');
  console.error('   Set MONGODB_URI to your real MongoDB (Atlas) connection string.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes (only explanation routes)
app.use('/api', explanationRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Explanation Service is running',
    timestamp: new Date().toISOString(),
    component: 'Component 5 - Explanation & Transparency Module'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mobile app can connect to: http://localhost:${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
  console.log(`   - POST http://localhost:${PORT}/api/explanations`);
  console.log(`   - GET  http://localhost:${PORT}/api/explanations/:responseId`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the other process or change PORT in backend/.env`);
    process.exit(1);
  }
});