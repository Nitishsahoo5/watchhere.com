const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  isPublic: { type: Boolean, default: true },
  thumbnail: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);