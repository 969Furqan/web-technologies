const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  tags: [String],
  uploadDate: { type: Date, default: Date.now },
  img: { data: Buffer, contentType: String }
});

const Wallpaper = mongoose.model('uploads', wallpaperSchema);
module.exports = Wallpaper;
