const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const sourceRoutes = require('./routes/sources');

const app = express();

// 💡 Middleware — processes requests before they reach routes
app.use(cors());
app.use(express.json());

// 💡 Routes
app.use('/api/sources', sourceRoutes);

// 💡 Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error.message);
  });