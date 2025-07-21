const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String }, // Can be empty for OAuth
  image:    { type: String }, // Optional: profile pic
  isOAuth:  { type: Boolean, default: false } // Optional
});

module.exports = mongoose.model('User', userSchema);
