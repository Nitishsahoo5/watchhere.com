const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  watchTime: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  engagement: {
    liked: { type: Boolean, default: false },
    commented: { type: Boolean, default: false },
    shared: { type: Boolean, default: false }
  },
  sessionId: { type: String, required: true },
  device: { type: String, enum: ['web', 'mobile', 'tablet'], default: 'web' }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);