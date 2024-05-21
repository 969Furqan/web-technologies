const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
    tags: [String],
    uploadDate: { type: Date, default: Date.now },
    /* likes: { type: Number, default: 0 } */
  });
  
  const Wallpaper = mongoose.model('Wallpaper', wallpaperSchema);
  module.exports = Wallpaper;