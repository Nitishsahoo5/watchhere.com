const express = require('express');
const { moderateContent } = require('../services/moderationService');
const { generateVideoMetadata } = require('../services/summaryService');
const { updateUserPreferences } = require('../services/recommendationService');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

const router = express.Router();

// Process video with AI after upload
router.post('/process/:videoId', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Content moderation
    const moderationResult = await moderateContent({
      title: video.title,
      description: video.description,
      videoUrl: video.url,
      thumbnail: video.thumbnail
    });

    // Generate AI metadata
    const metadata = await generateVideoMetadata(video.url, {
      title: video.title,
      category: video.category,
      duration: video.duration
    });

    // Update video with AI results
    await Video.findByIdAndUpdate(req.params.videoId, {
      moderationStatus: moderationResult.action === 'approve' ? 'approved' : 'flagged',
      moderationResults: moderationResult.results,
      aiSummary: metadata.summary,
      aiHashtags: metadata.hashtags,
      isProcessed: true
    });

    res.json({
      message: 'AI processing complete',
      moderation: moderationResult,
      metadata
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update engagement for recommendations
router.post('/engagement', auth, async (req, res) => {
  try {
    const { videoId, action, watchTime } = req.body;
    
    await updateUserPreferences(req.user._id, videoId, action);
    
    if (watchTime) {
      await Video.findByIdAndUpdate(videoId, {
        $inc: { watchTime: watchTime }
      });
    }

    res.json({ message: 'Engagement updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;