# 🚀 WatchHere Development Setup

## Quick Start Commands

### Option 1: Cross-Platform Node.js Script (Recommended)
```bash
node start-dev.js
```

### Option 2: Platform-Specific Scripts

**Windows:**
```cmd
start-dev.bat
```

**Linux/macOS:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 3: NPM Script
```bash
cd backend
npm run dev:full
```

## What the Scripts Do

1. **🔍 Check Prerequisites**
   - Node.js installation
   - Docker availability (optional)

2. **🗄️ Start MongoDB**
   - Try local MongoDB service first
   - Fall back to Docker container
   - Create persistent data volume

3. **🔄 Start Redis (Optional)**
   - Try local Redis service first
   - Fall back to Docker container
   - Continue without Redis if unavailable

4. **🚀 Start Backend Server**
   - Auto-detect available port (5000+)
   - Load environment variables
   - Connect to databases

## Expected Output

```
🎬 Starting WatchHere Development Environment
==================================================

🔄 Checking MongoDB...
✅ MongoDB Docker container started
⏳ Waiting for MongoDB to be ready...
✅ MongoDB is ready

🔄 Checking Redis...
✅ Redis Docker container started
⏳ Waiting for Redis to be ready...
✅ Redis is ready

🔄 Starting WatchHere Backend...
🚀 Starting Node.js server...

========================================
  WatchHere Backend Starting...
========================================

🔄 Attempting to connect to Redis...
✅ Redis connected and ready
MongoDB Connected: localhost
✅ Server running on port 5000

🎉 WatchHere Development Environment Started!
⏱️ Startup completed in 8.2s

📋 Services Status:
   MongoDB: ✅ Running
   Redis: ✅ Running
   Backend: 🚀 Starting...

🌐 Access your application at: http://localhost:5000
📊 Health check: http://localhost:5000/health

💡 Press Ctrl+C to stop all services
```

## Manual Setup (Alternative)

If scripts don't work, start services manually:

### 1. Start MongoDB
```bash
# Option A: Local service
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Option B: Docker
docker run -d --name watchhere-mongo -p 27017:27017 -v watchhere-mongo-data:/data/db mongo:latest
```

### 2. Start Redis (Optional)
```bash
# Option A: Local service
sudo systemctl start redis  # Linux
brew services start redis  # macOS

# Option B: Docker
docker run -d --name watchhere-redis -p 6379:6379 redis:alpine
```

### 3. Start Backend
```bash
cd backend
node server.js
```

## Troubleshooting

### Port Already in Use
- Scripts automatically find next available port
- Or manually kill process: `taskkill /PID <PID> /F` (Windows) or `kill <PID>` (Unix)

### MongoDB Connection Failed
- Check if MongoDB service is running
- Verify Docker is installed and running
- Check firewall settings for port 27017

### Redis Connection Failed
- Redis is optional - backend will continue without it
- Check Docker is installed for Redis container
- Verify port 6379 is available

### Docker Issues
- Ensure Docker Desktop is running
- Check Docker daemon status: `docker --version`
- Restart Docker service if needed

## Environment Variables

Create `backend/.env` with:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/watchhere

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=development
```

## Stopping Services

**Graceful Shutdown:**
- Press `Ctrl+C` in terminal running the script

**Manual Cleanup:**
```bash
# Stop Docker containers
docker stop watchhere-mongo watchhere-redis

# Remove containers (optional)
docker rm watchhere-mongo watchhere-redis

# Remove volumes (optional - will delete data)
docker volume rm watchhere-mongo-data
```