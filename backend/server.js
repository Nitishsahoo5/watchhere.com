require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { connectDB } = require('./config/database');
const { createRedisClient, closeRedisConnection } = require('./config/redis');
const { initSocket } = require('./services/socketService');
const { rateLimits, sanitizeInput, securityHeaders, enforceHTTPS } = require('./middleware/security');
const { passport } = require('./services/oauthService');

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const uploadRoutes = require('./routes/uploadV3');
const downloadRoutes = require('./routes/downloadV3');
const cachedVideoRoutes = require('./routes/cachedVideos');
const commentRoutes = require('./routes/comments');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const liveStreamRoutes = require('./routes/liveStream');
const playlistRoutes = require('./routes/playlist');

const notificationRoutes = require('./routes/notifications');
const recommendationRoutes = require('./routes/recommendations');
const voiceSearchRoutes = require('./routes/voiceSearch');
const aiFeaturesRoutes = require('./routes/aiFeatures');

const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Initialize Redis (optional)
createRedisClient();

// Initialize Socket.IO
initSocket(server);

// Security middleware
app.use(enforceHTTPS);
app.use(securityHeaders);
app.use(cors());
app.use(rateLimits.general);
app.use(sanitizeInput);
app.use(passport.initialize());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/upload', rateLimits.upload, uploadRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/cached-videos', cachedVideoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/live', liveStreamRoutes);
app.use('/api/playlists', playlistRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/voice-search', voiceSearchRoutes);
app.use('/api/ai', aiFeaturesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Helper function to find available port
const findAvailablePort = async (startPort, maxRetries = 10) => {
  const net = require('net');
  
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const testServer = net.createServer();
      testServer.listen(port, () => {
        testServer.close(() => resolve(true));
      });
      testServer.on('error', () => resolve(false));
    });
  };

  for (let i = 0; i < maxRetries; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found after ${maxRetries} attempts starting from ${startPort}`);
};

// Start server with automatic port detection
const startServer = async () => {
  try {
    const startPort = parseInt(process.env.PORT) || 5000;
    const port = await findAvailablePort(startPort);
    
    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('📴 Received SIGTERM, shutting down gracefully...');
      await closeRedisConnection();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('📴 Received SIGINT, shutting down gracefully...');
      await closeRedisConnection();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();