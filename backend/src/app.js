const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'Backend is running' });
});

app.use('/api/analyses', analysisRoutes);
app.use('/api/analysis', analysisRoutes); // Keep for compatibility

module.exports = app;