const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    uploadedWallpapers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wallpaper' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  const User = mongoose.model('User', userSchema);
  