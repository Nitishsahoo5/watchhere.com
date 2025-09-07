const express = require('express');
const { getVideos, likeVideo } = require('../controllers/videoController');
const auth = require('../middleware/auth');
const { getCachedVideo, cacheVideo, getCachedVideoList, cacheVideoList, invalidateVideoCache } = require('../services/cacheService');
const { optimizeVideoDelivery } = require('../services/cdnService');
const Video = require('../models/Video');

const router = express.Router();

// Get videos with caching
router.get('/', async (req, res) => {
  try {
    const { page = 1, category, search } = req.query;
    const cacheKey = `videos:${page}:${category || 'all'}:${search || 'none'}`;
    
    // Check cache first
    let cachedVideos = await getCachedVideoList(cacheKey);
    if (cachedVideos) {
      return res.json(cachedVideos);
    }
    
    // Fallback to controller
    await getVideos(req, res);
    
    // Cache the response
    if (res.locals.videos) {
      await cacheVideoList(cacheKey, res.locals.videos);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single video with caching and CDN URLs
router.get('/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    
    // Check cache first
    let video = await getCachedVideo(videoId);
    
    if (!video) {
      video = await Video.findById(videoId).populate('uploader', 'username avatar');
      if (!video) return res.status(404).json({ message: 'Video not found' });
      
      // Cache the video
      await cacheVideo(videoId, video);
    }
    
    // Add CDN URLs
    const optimizedUrls = optimizeVideoDelivery(video.url);
    video.streamingUrls = optimizedUrls;
    
    // Increment views
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    await likeVideo(req, res);
    // Invalidate cache after like
    await invalidateVideoCache(req.params.id);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;