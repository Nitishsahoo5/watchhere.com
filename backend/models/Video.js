const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  category: { type: String, default: 'General' },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // AI Features
  aiSummary: { type: String, default: '' },
  aiHashtags: [{ type: String }],
  moderationStatus: { type: String, enum: ['pending', 'approved', 'flagged'], default: 'pending' },
  moderationResults: { type: Object, default: {} },
  engagementScore: { type: Number, default: 0 },
  isProcessed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);