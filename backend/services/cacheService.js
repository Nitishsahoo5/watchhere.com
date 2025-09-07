const redis = require('redis');

let client = null;
let isRedisConnected = false;
let connectionAttempted = false;

const initRedis = async () => {
  if (connectionAttempted) return;
  connectionAttempted = true;
  
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          if (retries > 3) return false; // Stop retrying after 3 attempts
          return Math.min(retries * 50, 500);
        }
      }
    });
    
    client.on('error', () => {
      isRedisConnected = false;
    });
    
    client.on('connect', () => {
      console.log('✅ Redis Connected');
      isRedisConnected = true;
    });
    
    client.on('disconnect', () => {
      console.log('⚠️  Redis Disconnected');
      isRedisConnected = false;
    });
    
    await client.connect();
  } catch (error) {
    console.log('⚠️  Redis unavailable - running without cache');
    isRedisConnected = false;
    client = null;
  }
};

// Initialize Redis connection
initRedis();

const CACHE_TTL = {
  VIDEO: 3600,        // 1 hour
  USER: 1800,         // 30 minutes
  TRENDING: 900,      // 15 minutes
  RECOMMENDATIONS: 1800 // 30 minutes
};

const cacheVideo = async (videoId, videoData) => {
  if (!isRedisConnected || !client) return;
  try {
    await client.setEx(`video:${videoId}`, CACHE_TTL.VIDEO, JSON.stringify(videoData));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

const getCachedVideo = async (videoId) => {
  if (!isRedisConnected || !client) return null;
  try {
    const cached = await client.get(`video:${videoId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const cacheVideoList = async (key, videos, ttl = CACHE_TTL.VIDEO) => {
  if (!isRedisConnected || !client) return;
  try {
    await client.setEx(key, ttl, JSON.stringify(videos));
  } catch (error) {
    console.error('Cache list error:', error);
  }
};

const getCachedVideoList = async (key) => {
  if (!isRedisConnected || !client) return null;
  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get list error:', error);
    return null;
  }
};

const invalidateVideoCache = async (videoId) => {
  if (!isRedisConnected || !client) return;
  try {
    await client.del(`video:${videoId}`);
    // Clear related caches
    const keys = await client.keys('videos:*');
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

const cacheRecommendations = async (userId, recommendations) => {
  if (!isRedisConnected || !client) return;
  try {
    await client.setEx(`recommendations:${userId}`, CACHE_TTL.RECOMMENDATIONS, JSON.stringify(recommendations));
  } catch (error) {
    console.error('Cache recommendations error:', error);
  }
};

const getCachedRecommendations = async (userId) => {
  if (!isRedisConnected || !client) return null;
  try {
    const cached = await client.get(`recommendations:${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Get cached recommendations error:', error);
    return null;
  }
};

module.exports = {
  client,
  cacheVideo,
  getCachedVideo,
  cacheVideoList,
  getCachedVideoList,
  invalidateVideoCache,
  cacheRecommendations,
  getCachedRecommendations,
  CACHE_TTL
};