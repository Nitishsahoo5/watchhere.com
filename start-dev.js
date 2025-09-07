#!/usr/bin/env node

/**
 * WatchHere Development Environment Startup Script
 * 
 * This script automatically starts all required services:
 * - MongoDB (local service or Docker)
 * - Redis (Docker)
 * - Node.js Backend Server
 * 
 * Usage: node start-dev.js
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(false));
    });
    
    server.on('error', () => resolve(true));
  });
};

// Check if a service is running
const isServiceRunning = async (command) => {
  try {
    await execAsync(command);
    return true;
  } catch (error) {
    return false;
  }
};

// Start MongoDB
const startMongoDB = async () => {
  log('\n🔄 Checking MongoDB...', colors.yellow);
  
  try {
    // Check if MongoDB is already running
    const mongoRunning = await isServiceRunning('mongosh --eval "db.runCommand({ping: 1})" --quiet');
    
    if (mongoRunning) {
      log('✅ MongoDB is already running', colors.green);
      return true;
    }

    log('🚀 Starting MongoDB...', colors.blue);

    if (isWindows) {
      // Try to start MongoDB service on Windows
      try {
        await execAsync('net start MongoDB');
        log('✅ MongoDB service started', colors.green);
        return true;
      } catch (error) {
        log('⚠️ MongoDB service not found, trying Docker...', colors.yellow);
      }
    }

    // Try Docker MongoDB for all platforms
    const dockerRunning = await isServiceRunning('docker --version');
    if (!dockerRunning) {
      log('❌ Docker not available. Please install MongoDB or Docker', colors.red);
      return false;
    }

    // Check if MongoDB container exists
    try {
      const { stdout } = await execAsync('docker ps -a --filter name=watchhere-mongo --format "{{.Names}}"');
      
      if (stdout.includes('watchhere-mongo')) {
        // Container exists, start it
        await execAsync('docker start watchhere-mongo');
        log('✅ MongoDB Docker container started', colors.green);
      } else {
        // Create and start new container
        await execAsync(`docker run -d --name watchhere-mongo -p 27017:27017 -v watchhere-mongo-data:/data/db mongo:latest`);
        log('✅ MongoDB Docker container created and started', colors.green);
      }
      
      // Wait for MongoDB to be ready
      log('⏳ Waiting for MongoDB to be ready...', colors.yellow);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return true;
    } catch (error) {
      log(`❌ Failed to start MongoDB: ${error.message}`, colors.red);
      return false;
    }

  } catch (error) {
    log(`❌ MongoDB startup error: ${error.message}`, colors.red);
    return false;
  }
};

// Start Redis
const startRedis = async () => {
  log('\n🔄 Checking Redis...', colors.yellow);
  
  try {
    // Check if Redis is already running
    const redisRunning = await isPortInUse(6379);
    
    if (redisRunning) {
      log('✅ Redis is already running on port 6379', colors.green);
      return true;
    }

    log('🚀 Starting Redis...', colors.blue);

    // Check Docker availability
    const dockerRunning = await isServiceRunning('docker --version');
    if (!dockerRunning) {
      log('❌ Docker not available. Please install Redis or Docker', colors.red);
      return false;
    }

    // Check if Redis container exists
    try {
      const { stdout } = await execAsync('docker ps -a --filter name=watchhere-redis --format "{{.Names}}"');
      
      if (stdout.includes('watchhere-redis')) {
        // Container exists, start it
        await execAsync('docker start watchhere-redis');
        log('✅ Redis Docker container started', colors.green);
      } else {
        // Create and start new container
        await execAsync(`docker run -d --name watchhere-redis -p 6379:6379 redis:alpine redis-server --appendonly yes`);
        log('✅ Redis Docker container created and started', colors.green);
      }
      
      // Wait for Redis to be ready
      log('⏳ Waiting for Redis to be ready...', colors.yellow);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      log(`❌ Failed to start Redis: ${error.message}`, colors.red);
      log('📝 Continuing without Redis (optional service)...', colors.yellow);
      return false;
    }

  } catch (error) {
    log(`❌ Redis startup error: ${error.message}`, colors.red);
    log('📝 Continuing without Redis (optional service)...', colors.yellow);
    return false;
  }
};

// Start Backend Server
const startBackend = async () => {
  log('\n🔄 Starting WatchHere Backend...', colors.yellow);
  
  try {
    // Change to backend directory
    const backendPath = path.join(__dirname, 'backend');
    
    if (!fs.existsSync(backendPath)) {
      log('❌ Backend directory not found', colors.red);
      return false;
    }

    process.chdir(backendPath);
    
    // Check if server.js exists
    if (!fs.existsSync('server.js')) {
      log('❌ server.js not found in backend directory', colors.red);
      return false;
    }

    log('🚀 Starting Node.js server...', colors.blue);
    
    // Start the server
    const serverProcess = spawn('node', ['server.js'], {
      stdio: 'inherit',
      cwd: backendPath,
    });

    serverProcess.on('error', (error) => {
      log(`❌ Failed to start server: ${error.message}`, colors.red);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        log(`❌ Server exited with code ${code}`, colors.red);
      }
    });

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;

  } catch (error) {
    log(`❌ Backend startup error: ${error.message}`, colors.red);
    return false;
  }
};

// Main startup function
const startDevelopment = async () => {
  log('🎬 Starting WatchHere Development Environment', colors.bright + colors.magenta);
  log('=' .repeat(50), colors.magenta);
  
  const startTime = Date.now();
  
  try {
    // Start services in sequence
    const mongoStarted = await startMongoDB();
    const redisStarted = await startRedis();
    
    if (!mongoStarted) {
      log('\n❌ Cannot continue without MongoDB', colors.red);
      process.exit(1);
    }
    
    // Start backend
    await startBackend();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    log('\n' + '=' .repeat(50), colors.green);
    log('🎉 WatchHere Development Environment Started!', colors.bright + colors.green);
    log(`⏱️ Startup completed in ${duration}s`, colors.green);
    log('\n📋 Services Status:', colors.bright);
    log(`   MongoDB: ${mongoStarted ? '✅ Running' : '❌ Failed'}`, mongoStarted ? colors.green : colors.red);
    log(`   Redis: ${redisStarted ? '✅ Running' : '⚠️ Optional (not running)'}`, redisStarted ? colors.green : colors.yellow);
    log('   Backend: 🚀 Starting...', colors.blue);
    log('\n🌐 Access your application at: http://localhost:5000', colors.cyan);
    log('📊 Health check: http://localhost:5000/health', colors.cyan);
    log('\n💡 Press Ctrl+C to stop all services', colors.yellow);
    
  } catch (error) {
    log(`\n❌ Startup failed: ${error.message}`, colors.red);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('\n\n🛑 Shutting down development environment...', colors.yellow);
  
  try {
    // Stop Docker containers
    await execAsync('docker stop watchhere-mongo watchhere-redis').catch(() => {});
    log('📴 Docker containers stopped', colors.green);
  } catch (error) {
    // Ignore errors during shutdown
  }
  
  log('👋 Goodbye!', colors.green);
  process.exit(0);
});

// Start the development environment
startDevelopment();