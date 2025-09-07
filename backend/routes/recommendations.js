const express = require('express');
const { getRecommendations, updateUserPreferences } = require('../services/recommendationService');
const { getCachedRecommendations, cacheRecommendations } = require('../services/cacheService');
const auth = require('../middleware/auth');

const router = express.Router();

// Get personalized recommendations with caching
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user._id;
    
    // Check cache first
    let recommendations = await getCachedRecommendations(userId);
    
    if (!recommendations) {
      recommendations = await getRecommendations(userId, parseInt(limit));
      // Cache recommendations
      await cacheRecommendations(userId, recommendations);
    }
    
    res.json({
      recommendations,
      count: recommendations.length,
      personalized: true,
      cached: !!recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user preferences (called when user interacts with videos)
router.post('/feedback', auth, async (req, res) => {
  try {
    const { videoId, action } = req.body; // action: 'watch', 'like', 'skip'
    
    await updateUserPreferences(req.user._id, videoId, action);
    
    res.json({ message: 'Preferences updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending videos (fallback recommendations)
router.get('/trending', async (req, res) => {
  try {
    const Video = require('../models/Video');
    
    const trending = await Video.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    .populate('uploader', 'username avatar')
    .sort({ views: -1, likes: -1 })
    .limit(20);

    res.json({ recommendations: trending, personalized: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;