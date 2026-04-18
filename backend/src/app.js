const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/analysisRoutes');
const authRoutes = require('./routes/authRoutes');
const sourceRoutes = require('./routes/sourceRoutes');
const scoringRoutes = require('./routes/scoringRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Request logger — shows every inbound call from mobile/web
app.use((req, res, next) => {
  const hasAuth = req.headers.authorization ? '✅ TOKEN' : '❌ NO TOKEN';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | ${hasAuth} | IP: ${req.ip}`);
  next();
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TruthLens Unified API is running 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/analysis', analysisRoutes); // Keep for compatibility
app.use('/api/sources', sourceRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/feedback', feedbackRoutes);

module.exports = app;