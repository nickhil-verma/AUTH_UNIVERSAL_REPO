require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('../routes/auth');

const app = express();

// Allow CORS from any origin
app.use(cors({
  origin: '*', // Allows requests from any domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
}));

app.use(express.json());

app.use('/api/auth', authRoutes);

// Define "/hello" route to render WORLD!
app.get('/hello', (req, res) => {
  try {
    res.send('<script>document.write("WORLD!");</script>');
  } catch (error) {
    console.error('Error handling /hello route:', error);
    res.status(500).send('Internal Server Error');
  }
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  app.listen(process.env.PORT, () => console.log(`🌐 Server running on: ${process.env.PORT}`));
  console.log('🚀 MongoDB Connected Successfully!');
  console.log('🔐 Auth routes available at /api/auth');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1); // Exit if MongoDB connection fails
});
