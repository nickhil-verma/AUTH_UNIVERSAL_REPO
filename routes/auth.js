const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');
require('dotenv').config();
const { handleOAuthCallback } = require("../passport"); // Make sure path is correct

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
};

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || password.length < 8) {
    return res.status(400).json({ error: 'All fields required & password ≥ 8 chars' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) return res.status(400).json({ error: 'Email already registered' });
      if (existingUser.username === username) return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  try {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, username: user.username, email: user.email });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback", passport.authenticate("github", { session: false }), handleOAuthCallback);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), handleOAuthCallback);

module.exports = router;
