const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  streamer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  streamKey: { type: String, required: true, unique: true },
  isLive: { type: Boolean, default: false },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  viewerCount: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  thumbnail: { type: String, default: '' },
  startedAt: { type: Date },
  endedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('LiveStream', liveStreamSchema);