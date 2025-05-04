const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Required for Vercel: export the app
module.exports = app;

// Connect MongoDB only when not running in serverless (like Vercel)
if (process.env.NODE_ENV !== 'production') {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => console.log(`🚀 Server running on port ${process.env.PORT || 5000}`));
  }).catch(err => console.error(err));
}
