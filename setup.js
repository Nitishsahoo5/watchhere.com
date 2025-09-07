#!/usr/bin/env node

/**
 * WatchHere Quick Setup Script
 * 
 * This script helps you set up the WatchHere development environment
 * by guiding you through the configuration process.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const setupEnvironment = async () => {
  log('🎬 Welcome to WatchHere Setup!', colors.bright + colors.magenta);
  log('=' .repeat(50), colors.magenta);
  log('This script will help you configure your development environment.\n', colors.cyan);

  const config = {};

  // Basic Configuration
  log('📋 Basic Configuration', colors.bright + colors.blue);
  config.PORT = await question('Server port (default: 5000): ') || '5000';
  config.NODE_ENV = 'development';
  config.FRONTEND_URL = await question('Frontend URL (default: http://localhost:3000): ') || 'http://localhost:3000';

  // Database Configuration
  log('\n🗄️ Database Configuration', colors.bright + colors.blue);
  const useLocalMongo = await question('Use local MongoDB? (y/n, default: y): ');
  if (useLocalMongo.toLowerCase() !== 'n') {
    config.MONGODB_URI = 'mongodb://localhost:27017/watchhere';
    log('✅ Using local MongoDB', colors.green);
  } else {
    config.MONGODB_URI = await question('MongoDB Atlas URI: ');
  }

  // Redis Configuration
  log('\n🔄 Redis Configuration (Optional)', colors.bright + colors.blue);
  const useRedis = await question('Use Redis caching? (y/n, default: y): ');
  if (useRedis.toLowerCase() !== 'n') {
    config.REDIS_HOST = 'localhost';
    config.REDIS_PORT = '6379';
    log('✅ Using local Redis via Docker', colors.green);
  }

  // AWS Configuration
  log('\n☁️ AWS Configuration', colors.bright + colors.blue);
  log('You need AWS credentials for S3 storage. Get them from:', colors.yellow);
  log('https://console.aws.amazon.com/iam/home#/security_credentials', colors.cyan);
  
  config.AWS_ACCESS_KEY_ID = await question('AWS Access Key ID: ');
  config.AWS_SECRET_ACCESS_KEY = await question('AWS Secret Access Key: ');
  config.AWS_REGION = await question('AWS Region (default: us-east-1): ') || 'us-east-1';
  config.S3_BUCKET_NAME = await question('S3 Bucket Name: ');

  // Security Configuration
  log('\n🔐 Security Configuration', colors.bright + colors.blue);
  config.JWT_SECRET = await question('JWT Secret (or press Enter to generate): ');
  if (!config.JWT_SECRET) {
    config.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
    log('✅ Generated JWT secret', colors.green);
  }
  config.BCRYPT_ROUNDS = '12';

  // Optional Services
  log('\n🔧 Optional Services', colors.bright + colors.blue);
  const setupOAuth = await question('Setup OAuth (Google/GitHub)? (y/n, default: n): ');
  if (setupOAuth.toLowerCase() === 'y') {
    log('Google OAuth setup: https://console.developers.google.com', colors.cyan);
    config.GOOGLE_CLIENT_ID = await question('Google Client ID (optional): ');
    config.GOOGLE_CLIENT_SECRET = await question('Google Client Secret (optional): ');
    
    log('GitHub OAuth setup: https://github.com/settings/applications', colors.cyan);
    config.GITHUB_CLIENT_ID = await question('GitHub Client ID (optional): ');
    config.GITHUB_CLIENT_SECRET = await question('GitHub Client Secret (optional): ');
  }

  const setupOpenAI = await question('Setup OpenAI integration? (y/n, default: n): ');
  if (setupOpenAI.toLowerCase() === 'y') {
    log('Get API key from: https://platform.openai.com/api-keys', colors.cyan);
    config.OPENAI_API_KEY = await question('OpenAI API Key: ');
  }

  // Generate .env file
  log('\n📝 Generating configuration files...', colors.yellow);
  
  const envContent = Object.entries(config)
    .filter(([key, value]) => value && value.trim() !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const envPath = path.join(__dirname, 'backend', '.env');
  fs.writeFileSync(envPath, envContent);
  log('✅ Created backend/.env', colors.green);

  // Summary
  log('\n🎉 Setup Complete!', colors.bright + colors.green);
  log('=' .repeat(50), colors.green);
  log('Your WatchHere backend is now configured.', colors.green);
  
  log('\n📋 Next Steps:', colors.bright);
  log('1. Install dependencies:', colors.cyan);
  log('   cd backend && npm install', colors.white);
  log('2. Start development environment:', colors.cyan);
  log('   node start-dev.js', colors.white);
  log('3. Visit: http://localhost:' + config.PORT + '/health', colors.cyan);

  if (!config.AWS_ACCESS_KEY_ID || !config.S3_BUCKET_NAME) {
    log('\n⚠️ Warning:', colors.yellow);
    log('AWS credentials are required for video uploads.', colors.yellow);
    log('Update backend/.env with your AWS credentials.', colors.yellow);
  }

  log('\n📖 For more information, see README.md', colors.cyan);
  
  rl.close();
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Setup cancelled', colors.yellow);
  rl.close();
  process.exit(0);
});

// Run setup
setupEnvironment().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});