const { createClient } = require('redis');

let redisClient = null;
let isRedisConnected = false;

// Redis configuration
const createRedisClient = async () => {
  try {
    // Option 1: Use REDIS_URL from environment (for cloud Redis like AWS ElastiCache, Redis Cloud)
    // Option 2: Use local Redis with default settings
    const redisConfig = process.env.REDIS_URL 
      ? { url: process.env.REDIS_URL }
      : {
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
          },
          // Optional: Add password for local Redis
          // password: process.env.REDIS_PASSWORD,
        };

    console.log('🔄 Attempting to connect to Redis...');
    
    redisClient = createClient(redisConfig);

    // Error handling
    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis connection error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected and ready');
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      console.log('📴 Redis connection closed');
      isRedisConnected = false;
    });

    // Connect to Redis
    await redisClient.connect();
    
    return redisClient;

  } catch (error) {
    console.warn('⚠️ Redis unavailable:', error.message);
    console.log('📝 Continuing without Redis caching...');
    isRedisConnected = false;
    return null;
  }
};

// Helper functions for cache operations
const setCache = async (key, value, expireInSeconds = 3600) => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }

  try {
    const serializedValue = JSON.stringify(value);
    await redisClient.setEx(key, expireInSeconds, serializedValue);
    return true;
  } catch (error) {
    console.warn('⚠️ Redis SET error:', error.message);
    return false;
  }
};

const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) {
    return null;
  }

  try {
    const cachedValue = await redisClient.get(key);
    return cachedValue ? JSON.parse(cachedValue) : null;
  } catch (error) {
    console.warn('⚠️ Redis GET error:', error.message);
    return null;
  }
};

const deleteCache = async (key) => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.warn('⚠️ Redis DELETE error:', error.message);
    return false;
  }
};

const flushCache = async () => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }

  try {
    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.warn('⚠️ Redis FLUSH error:', error.message);
    return false;
  }
};

// Check if Redis is available
const isRedisAvailable = () => isRedisConnected;

// Graceful shutdown
const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('📴 Redis connection closed gracefully');
    } catch (error) {
      console.warn('⚠️ Error closing Redis connection:', error.message);
    }
  }
};

module.exports = {
  createRedisClient,
  setCache,
  getCache,
  deleteCache,
  flushCache,
  isRedisAvailable,
  closeRedisConnection,
  getClient: () => redisClient,
};