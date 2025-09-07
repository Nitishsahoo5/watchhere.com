# 🚀 WatchHere Local Development Setup

## Prerequisites

### Required Software
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **MongoDB** (v6+) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://cloud.mongodb.com)
- **Redis** (v7+) - [Download](https://redis.io/download) or use Redis Cloud
- **Git** - [Download](https://git-scm.com/)

### Optional (for full features)
- **FFmpeg** - [Download](https://ffmpeg.org/download.html)
- **Docker** - [Download](https://www.docker.com/products/docker-desktop)

## 🔧 Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/watchhere-platform.git
cd watchhere-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```
✅ Backend running on http://localhost:5000

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
# Edit .env.local if needed
npm run dev
```
✅ Frontend running on http://localhost:3000

### 4. Mobile Setup (Optional)
```bash
cd ../mobile
npm install
cp .env.example .env
# Edit .env with your IP address
npx expo start
```
✅ Mobile app running on Expo

## 📋 Detailed Setup

### Backend Configuration

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Environment Variables
```bash
cp .env.example .env
```

**Required Variables:**
```bash
# Database (choose one)
MONGODB_URI=mongodb://localhost:27017/watchhere  # Local
# OR
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/watchhere  # Atlas

# Authentication
JWT_SECRET=your_super_secret_key_min_32_characters

# Redis (choose one)
REDIS_URL=redis://localhost:6379  # Local
# OR
REDIS_URL=redis://username:password@host:port  # Cloud
```

**Optional Variables (for full features):**
```bash
# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your_openai_key

# OAuth (for social login)
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
```

#### 3. Start Development Server
```bash
npm run dev
```

### Frontend Configuration

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Environment Variables
```bash
cp .env.local.example .env.local
```

**Edit .env.local:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:5000
```

#### 3. Start Development Server
```bash
npm run dev
```

### Mobile Configuration

#### 1. Install Dependencies
```bash
cd mobile
npm install
```

#### 2. Environment Variables
```bash
cp .env.example .env
```

**Edit .env (replace with your computer's IP):**
```bash
API_BASE_URL=http://192.168.1.100:5000/api
WEBSOCKET_URL=ws://192.168.1.100:5000
```

**Find your IP address:**
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig | grep inet
```

#### 3. Start Expo Development Server
```bash
npx expo start
```

## 🔍 Verification

### Test Backend API
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK"}
```

### Test Frontend
- Open http://localhost:3000
- Should see WatchHere homepage

### Test Mobile
- Scan QR code with Expo Go app
- Should see mobile app interface

## 🛠️ Development Workflow

### Hot Reload
All apps support hot reload:
- **Backend**: Nodemon auto-restarts on file changes
- **Frontend**: Next.js hot reload on save
- **Mobile**: Expo fast refresh on save

### Database Setup

#### Local MongoDB
```bash
# Start MongoDB service
mongod

# Create database (optional - auto-created)
mongo
use watchhere
```

#### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create cluster (free tier available)
3. Get connection string
4. Add to `.env` file

### Redis Setup

#### Local Redis
```bash
# Start Redis server
redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

#### Redis Cloud (Recommended)
1. Create account at [Redis Cloud](https://redis.com/try-free/)
2. Create database
3. Get connection URL
4. Add to `.env` file

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

#### MongoDB Connection Error
```bash
# Check MongoDB is running
mongod --version

# Check connection string format
mongodb://localhost:27017/watchhere
```

#### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping

# Check Redis URL format
redis://localhost:6379
```

#### Mobile App Not Loading
```bash
# Check IP address is correct
# Use computer's IP, not localhost
API_BASE_URL=http://YOUR_COMPUTER_IP:5000/api

# Ensure firewall allows connections
# Windows: Allow Node.js through firewall
# macOS: System Preferences > Security & Privacy
```

### Environment Issues

#### Missing Environment Variables
```bash
# Backend
cp .env.example .env
# Edit required variables

# Frontend
cp .env.local.example .env.local
# Edit API URL

# Mobile
cp .env.example .env
# Edit IP address
```

#### Node Version Issues
```bash
# Check Node version
node --version
# Should be v18+

# Update Node.js
# Download from nodejs.org
```

## 📱 Mobile Development

### Physical Device Testing
1. Install Expo Go app
2. Connect to same WiFi network
3. Scan QR code from `npx expo start`

### iOS Simulator (macOS only)
```bash
npx expo start --ios
```

### Android Emulator
```bash
npx expo start --android
```

## 🎯 Next Steps

1. **Test Core Features**
   - User registration/login
   - Video upload (if AWS configured)
   - Video playback
   - Comments and likes

2. **Configure Optional Services**
   - AWS S3 for file storage
   - OpenAI for AI features
   - OAuth for social login

3. **Deploy to Production**
   - See `DEPLOYMENT.md` for production setup

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Frontend Components](./frontend/README.md)
- [Mobile App Guide](./mobile/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)