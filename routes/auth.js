const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('../models/User.js'); // Adjust the path as necessary

const JWT_SECRET = process.env.JWT_SECRET;

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || password.length < 8) {
    return res.status(400).json({ error: 'All fields required & password ≥ 8 chars' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: 'Username or Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Route
// Login Route (supports username OR email)
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
  
    try {
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
      });
  
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ token, username: user.username });
  
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  

module.exports = router;
