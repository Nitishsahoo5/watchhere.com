#!/usr/bin/env node

/**
 * PM2 Production Deployment Script for WatchHere Backend
 * 
 * This script deploys the WatchHere backend using PM2 process manager
 * for production environments with clustering and monitoring.
 */

const { exec } = require('child_process');
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

// PM2 Ecosystem Configuration
const pm2Config = {
  apps: [{
    name: 'watchhere-backend',
    script: './backend/server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Process management
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Monitoring
    monitoring: false, // Set to true for PM2 Plus monitoring
    
    // Advanced options
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true,
    
    // Health check
    health_check_grace_period: 3000,
    
    // Environment variables file
    env_file: './backend/.env'
  }]
};

const deployProduction = async () => {
  try {
    log('🚀 Starting WatchHere Backend Production Deployment', colors.bright + colors.magenta);
    log('=' .repeat(60), colors.magenta);
    
    // Check if PM2 is installed
    try {
      await execAsync('pm2 --version');
      log('✅ PM2 is installed', colors.green);
    } catch (error) {
      log('❌ PM2 not found. Installing PM2...', colors.yellow);
      await execAsync('npm install -g pm2');
      log('✅ PM2 installed successfully', colors.green);
    }
    
    // Create logs directory
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('./logs', { recursive: true });
      log('📁 Created logs directory', colors.blue);
    }
    
    // Write PM2 ecosystem file
    fs.writeFileSync('./ecosystem.config.js', `module.exports = ${JSON.stringify(pm2Config, null, 2)};`);
    log('📝 Created PM2 ecosystem configuration', colors.blue);
    
    // Install dependencies
    log('📦 Installing production dependencies...', colors.yellow);
    process.chdir('./backend');
    await execAsync('npm ci --only=production');
    process.chdir('..');
    log('✅ Dependencies installed', colors.green);
    
    // Stop existing PM2 processes
    try {
      await execAsync('pm2 stop watchhere-backend');
      await execAsync('pm2 delete watchhere-backend');
      log('🛑 Stopped existing processes', colors.yellow);
    } catch (error) {
      // Process might not exist, continue
    }
    
    // Start with PM2
    log('🚀 Starting application with PM2...', colors.blue);
    await execAsync('pm2 start ecosystem.config.js --env production');
    
    // Save PM2 configuration
    await execAsync('pm2 save');
    
    // Setup PM2 startup script
    try {
      const { stdout } = await execAsync('pm2 startup');
      log('⚙️ PM2 startup configuration:', colors.cyan);
      log(stdout, colors.cyan);
    } catch (error) {
      log('⚠️ Could not setup PM2 startup script (may require sudo)', colors.yellow);
    }
    
    // Show status
    const { stdout: status } = await execAsync('pm2 status');
    log('\n📊 PM2 Status:', colors.bright);
    console.log(status);
    
    // Show logs command
    log('\n📋 Useful PM2 Commands:', colors.bright + colors.cyan);
    log('  pm2 status              - Show process status', colors.cyan);
    log('  pm2 logs watchhere-backend - Show logs', colors.cyan);
    log('  pm2 restart watchhere-backend - Restart app', colors.cyan);
    log('  pm2 stop watchhere-backend - Stop app', colors.cyan);
    log('  pm2 monit               - Monitor processes', colors.cyan);
    
    log('\n🎉 WatchHere Backend deployed successfully!', colors.bright + colors.green);
    log('🌐 Application should be running on configured port', colors.green);
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, colors.red);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n🛑 Deployment interrupted', colors.yellow);
  process.exit(0);
});

// Run deployment
deployProduction();