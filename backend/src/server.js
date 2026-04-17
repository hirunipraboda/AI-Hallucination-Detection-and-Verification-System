require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const scoringRoutes = require('./routes/scoringRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/scoring', scoringRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scoring_module';

connectDB(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Scoring backend running on port ${PORT}`);
  });
});

module.exports = app;

