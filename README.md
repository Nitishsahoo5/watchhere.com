# 🎬 WatchHere - YouTube Clone Backend

A complete Node.js + Express backend for a video streaming platform with MongoDB, Redis, and AWS S3 integration.

## 🚀 Quick Start (Single Command)

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd watchhere-platform

# 2. Install dependencies
cd backend && npm install && cd ..

# 3. Setup environment
cp .env.example backend/.env
# Edit backend/.env with your values

# 4. Start everything
node start-dev.js
```

**That's it! 🎉** Your backend will be running with MongoDB, Redis, and all services.

## 📋 Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Docker** (optional, for MongoDB/Redis) ([Download](https://docker.com/))
- **AWS Account** (for S3 storage) ([Sign up](https://aws.amazon.com/))

## 🛠️ Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example backend/.env

# Edit with your values
nano backend/.env  # or use any text editor
```

**Required Environment Variables:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/watchhere

# AWS (Get from AWS Console)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Security
JWT_SECRET=your_super_secret_key_here
```

### 3. Start Development Environment

**Option A: Automatic (Recommended)**
```bash
node start-dev.js
```

**Option B: Docker Compose**
```bash
docker-compose -f docker-compose.dev.yml up -d
cd backend && npm run dev
```

**Option C: Manual**
```bash
# Terminal 1: Start MongoDB
docker run -d --name watchhere-mongo -p 27017:27017 mongo:latest

# Terminal 2: Start Redis
docker run -d --name watchhere-redis -p 6379:6379 redis:alpine

# Terminal 3: Start Backend
cd backend && npm run dev
```

## 🌐 API Endpoints

Once running, your API will be available at `http://localhost:5000`

### Core Endpoints
- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/videos/trending` - Get trending videos
- `POST /api/upload/video` - Upload video
- `GET /api/download/video/:id` - Stream video

### Cached Endpoints (with Redis)
- `GET /api/cached-videos/trending` - Cached trending videos
- `GET /api/cached-videos/:id` - Cached video details
- `GET /api/cached-videos/search/:query` - Cached search results

## 🐳 Docker Commands

### Development Services
```bash
# Start MongoDB + Redis
npm run docker:dev

# Stop services
npm run docker:stop

# View logs
npm run docker:logs

# Clean up (removes data)
npm run docker:clean
```

### Full Docker Setup
```bash
# Build and run everything in Docker
docker-compose -f docker-compose.dev.yml --profile full-docker up --build
```

## 🚀 Production Deployment

### Option 1: PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Deploy with clustering
node scripts/deploy-pm2.js

# Monitor
pm2 monit
```

### Option 2: Docker Production
```bash
# Build production image
docker build -t watchhere-backend ./backend

# Run production container
docker run -d \
  --name watchhere-prod \
  -p 5000:5000 \
  --env-file backend/.env \
  watchhere-backend
```

### Option 3: AWS ECS/Fargate
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t watchhere-backend ./backend
docker tag watchhere-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/watchhere-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/watchhere-backend:latest
```

## 🔧 Development Scripts

```bash
# Backend directory (cd backend)
npm run dev          # Start with nodemon
npm run dev:full     # Start with all services
npm run start        # Production start
npm run test         # Run tests
npm run lint         # Check code style
npm run docker:build # Build Docker image

# Root directory
node start-dev.js    # Start all services
```

## 🛑 Stopping Services

### Graceful Shutdown
- Press `Ctrl+C` in the terminal running `start-dev.js`

### Manual Cleanup
```bash
# Stop Docker containers
docker stop watchhere-mongo watchhere-redis
docker rm watchhere-mongo watchhere-redis

# Stop PM2 processes
pm2 stop watchhere-backend
pm2 delete watchhere-backend
```

## 📊 Monitoring & Logs

### Development
```bash
# View all logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service
docker logs watchhere-mongo -f
docker logs watchhere-redis -f
```

### Production (PM2)
```bash
pm2 logs watchhere-backend  # View logs
pm2 monit                   # Real-time monitoring
pm2 status                  # Process status
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Kill process
taskkill /PID <PID> /F        # Windows
kill <PID>                    # macOS/Linux
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
docker ps | grep mongo

# View MongoDB logs
docker logs watchhere-mongo

# Connect to MongoDB shell
docker exec -it watchhere-mongo mongosh
```

### Redis Connection Issues
```bash
# Check Redis status
docker ps | grep redis

# Test Redis connection
docker exec -it watchhere-redis redis-cli ping
```

### AWS S3 Issues
- Verify AWS credentials in `.env`
- Check S3 bucket permissions
- Ensure bucket exists in correct region

## 📁 Project Structure

```
watchhere-platform/
├── backend/                 # Node.js backend
│   ├── config/             # Database, Redis, AWS config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth, security middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── .env               # Environment variables
│   ├── server.js          # Main server file
│   └── package.json       # Dependencies
├── scripts/               # Deployment scripts
├── start-dev.js          # Development startup
├── docker-compose.dev.yml # Docker services
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@watchhere.com
- 💬 Discord: [WatchHere Community](https://discord.gg/watchhere)
- 📖 Documentation: [docs.watchhere.com](https://docs.watchhere.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Made with ❤️ by the WatchHere Team**