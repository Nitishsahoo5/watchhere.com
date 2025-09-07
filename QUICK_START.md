# WatchHere Quick Start Guide

## 1. Environment Setup

### Backend (.env)
```bash
# Copy example and fill values
cp backend/.env.example backend/.env
```

**Required values:**
```env
MONGODB_URI=mongodb://localhost:27017/watchhere
JWT_SECRET=your_32_char_secret_key_here_123456
OPENAI_API_KEY=sk-your_openai_key_here
AWS_ACCESS_KEY_ID=AKIA123456789
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=watchhere-dev
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)
```bash
cp frontend/.env.local.example frontend/.env.local
```

### Mobile (.env)
```bash
cp mobile/.env.example mobile/.env
# Replace 192.168.1.100 with your computer's IP
```

## 2. Install & Run (3 Terminals)

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

### Terminal 3 - Mobile
```bash
cd mobile
npm install
npx expo start
```

## 3. Verify AI Features

### Test Endpoints:
- Recommendations: `GET /api/recommendations`
- Moderation: `POST /api/ai/moderate`
- Voice Search: `POST /api/voice-search`

## 4. Run Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Mobile tests
cd mobile && npm test

# Integration tests
npm run test:integration
```

## 5. First Deployment

### AWS (ECS + Docker)
```bash
./deploy-production.sh
```

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Expo (Mobile)
```bash
cd mobile
eas build --platform all
eas submit --platform all
```