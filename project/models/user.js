const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now},
    role: { type: String, default: 'user', enum: ['user', 'admin'] }
  });
  
  const User = mongoose.model('User', userSchema);
  module.exports = User;