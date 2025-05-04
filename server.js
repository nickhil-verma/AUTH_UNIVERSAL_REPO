const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Only connect to Mongo if not in Vercel (which handles listening)
if (!process.env.VERCEL) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  }).catch(err => console.error(err));
} else {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('✅ MongoDB Connected on Vercel'));
}

// 👉 Export app for Vercel to use as a handler
module.exports = app;
