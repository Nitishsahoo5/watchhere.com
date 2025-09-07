const express = require('express');
const { setCache, getCache, deleteCache, isRedisAvailable } = require('../config/redis');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

const router = express.Router();

// Cache middleware for video routes
const cacheMiddleware = (cacheKey, expireInSeconds = 300) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available
    if (!isRedisAvailable()) {
      return next();
    }

    try {
      // Generate cache key with request parameters
      const key = typeof cacheKey === 'function' 
        ? cacheKey(req) 
        : `${cacheKey}:${JSON.stringify(req.query)}`;

      // Try to get from cache
      const cachedData = await getCache(key);
      
      if (cachedData) {
        console.log(`🎯 Cache HIT for key: ${key}`);
        return res.json({
          ...cachedData,
          cached: true,
          cacheTimestamp: new Date().toISOString(),
        });
      }

      console.log(`❌ Cache MISS for key: ${key}`);
      
      // Store cache key in res.locals for later use
      res.locals.cacheKey = key;
      res.locals.cacheExpire = expireInSeconds;
      next();

    } catch (error) {
      console.warn('⚠️ Cache middleware error:', error.message);
      next();
    }
  };
};

// Get trending videos with caching
router.get('/trending', 
  cacheMiddleware('trending_videos', 600), // Cache for 10 minutes
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      // Fetch from database
      const videos = await Video.find({ moderationStatus: 'approved' })
        .sort({ views: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('uploader', 'username avatar')
        .lean();

      const total = await Video.countDocuments({ moderationStatus: 'approved' });
      
      const result = {
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      // Cache the result if Redis is available
      if (isRedisAvailable() && res.locals.cacheKey) {
        await setCache(res.locals.cacheKey, result, res.locals.cacheExpire);
        console.log(`💾 Cached result for key: ${res.locals.cacheKey}`);
      }

      res.json(result);

    } catch (error) {
      console.error('Trending videos error:', error);
      res.status(500).json({ error: 'Failed to fetch trending videos' });
    }
  }
);

// Get video by ID with caching
router.get('/:videoId',
  cacheMiddleware((req) => `video:${req.params.videoId}`, 1800), // Cache for 30 minutes
  async (req, res) => {
    try {
      const { videoId } = req.params;

      const video = await Video.findById(videoId)
        .populate('uploader', 'username avatar subscribers')
        .lean();

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Increment view count (don't wait for completion)
      Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }).exec();

      // Cache the result
      if (isRedisAvailable() && res.locals.cacheKey) {
        await setCache(res.locals.cacheKey, video, res.locals.cacheExpire);
        console.log(`💾 Cached video: ${videoId}`);
      }

      res.json(video);

    } catch (error) {
      console.error('Get video error:', error);
      res.status(500).json({ error: 'Failed to fetch video' });
    }
  }
);

// Search videos with caching
router.get('/search/:query',
  cacheMiddleware((req) => `search:${req.params.query}:${JSON.stringify(req.query)}`, 900), // Cache for 15 minutes
  async (req, res) => {
    try {
      const { query } = req.params;
      const { page = 1, limit = 20, category, sortBy = 'relevance' } = req.query;

      // Build search criteria
      const searchCriteria = {
        $text: { $search: query },
        moderationStatus: 'approved',
      };

      if (category) {
        searchCriteria.category = category;
      }

      // Build sort criteria
      let sortCriteria = {};
      switch (sortBy) {
        case 'date':
          sortCriteria = { createdAt: -1 };
          break;
        case 'views':
          sortCriteria = { views: -1 };
          break;
        case 'relevance':
        default:
          sortCriteria = { score: { $meta: 'textScore' } };
          break;
      }

      const videos = await Video.find(searchCriteria)
        .sort(sortCriteria)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('uploader', 'username avatar')
        .lean();

      const total = await Video.countDocuments(searchCriteria);

      const result = {
        query,
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      // Cache the result
      if (isRedisAvailable() && res.locals.cacheKey) {
        await setCache(res.locals.cacheKey, result, res.locals.cacheExpire);
        console.log(`💾 Cached search: ${query}`);
      }

      res.json(result);

    } catch (error) {
      console.error('Search videos error:', error);
      res.status(500).json({ error: 'Failed to search videos' });
    }
  }
);

// Clear cache for specific video (admin only)
router.delete('/cache/:videoId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { videoId } = req.params;
    
    if (!isRedisAvailable()) {
      return res.json({ message: 'Redis not available, no cache to clear' });
    }

    // Clear specific video cache
    const deleted = await deleteCache(`video:${videoId}`);
    
    if (deleted) {
      console.log(`🗑️ Cleared cache for video: ${videoId}`);
      res.json({ message: 'Cache cleared successfully' });
    } else {
      res.json({ message: 'No cache found or failed to clear' });
    }

  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Get cache statistics (admin only)
router.get('/admin/cache-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!isRedisAvailable()) {
      return res.json({ 
        redis: 'unavailable',
        message: 'Redis is not connected'
      });
    }

    // Get Redis client for advanced operations
    const { getClient } = require('../config/redis');
    const client = getClient();

    if (!client) {
      return res.json({ redis: 'unavailable' });
    }

    // Get Redis info
    const info = await client.info('memory');
    const dbSize = await client.dbSize();

    res.json({
      redis: 'connected',
      keysCount: dbSize,
      memoryInfo: info,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

module.exports = router;