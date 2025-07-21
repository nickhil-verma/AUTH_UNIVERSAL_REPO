const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport'); // make sure you import this!
require('../passport'); // this sets up the passport strategy
const cors = require('cors');
const authRoutes = require('../routes/auth');

const app = express();
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:3000";
// CORS
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// JSON Parsing
app.use(express.json());

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET, // 🔐 This is required
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: false
  }
}));


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/hello', (req, res) => {
  res.send('WORLD!');
});

// MongoDB & Server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🌐 Server running on port ${process.env.PORT}`);
    console.log('🚀 MongoDB Connected');
  });
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
});