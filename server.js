require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
app.listen(process.env.PORT, () => console.log(`🌐 Server running on: ${process.env.PORT}`));
  console.log('🚀 MongoDB Connected Successfully!');
  console.log('🔐 Auth routes available at /api/auth');
  
}).catch(err => console.error(err));
