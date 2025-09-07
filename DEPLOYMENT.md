# 🚀 WatchHere Production Deployment Guide

## Prerequisites

### AWS Setup
```bash
# Install AWS CLI
aws configure
aws ecr create-repository --repository-name watchhere
aws ecs create-cluster --cluster-name watchhere-cluster
```

### Environment Variables
```bash
# GitHub Secrets Required
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_ACCOUNT_ID=123456789012
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
EXPO_TOKEN=your_expo_token
```

## 1. Backend Deployment (AWS ECS)

### Step 1: Create ECR Repository
```bash
aws ecr create-repository --repository-name watchhere --region us-east-1
```

### Step 2: Build and Push Docker Image
```bash
cd backend
docker build -t watchhere .
docker tag watchhere:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/watchhere:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Push image
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/watchhere:latest
```

### Step 3: Create ECS Service
```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition.json

# Create service
aws ecs create-service \
  --cluster watchhere-cluster \
  --service-name watchhere-backend \
  --task-definition watchhere-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

## 2. Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
vercel login
```

### Step 2: Deploy
```bash
cd frontend
vercel --prod
```

### Step 3: Set Environment Variables
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.watchhere.com
```

## 3. Mobile App Store Deployment

### Step 1: Setup EAS
```bash
cd mobile
npm install -g @expo/eas-cli
eas login
eas build:configure
```

### Step 2: Build Apps
```bash
# Android APK for testing
eas build --platform android --profile preview

# Production builds
eas build --platform android --profile production
eas build --platform ios --profile production
```

### Step 3: Submit to Stores
```bash
# Google Play Store
eas submit --platform android --profile production

# Apple App Store
eas submit --platform ios --profile production
```

## 4. Domain & SSL Setup

### Step 1: Route 53 DNS
```bash
# Create hosted zone
aws route53 create-hosted-zone --name watchhere.com --caller-reference $(date +%s)

# Add A record pointing to ALB
aws route53 change-resource-record-sets --hosted-zone-id Z123456789 --change-batch file://dns-records.json
```

### Step 2: SSL Certificate
```bash
# Request certificate
aws acm request-certificate --domain-name watchhere.com --domain-name *.watchhere.com --validation-method DNS
```

## 5. Monitoring & Logging

### CloudWatch Setup
```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/watchhere-backend

# Create dashboard
aws cloudwatch put-dashboard --dashboard-name WatchHere --dashboard-body file://cloudwatch-dashboard.json
```

## 6. Auto-Deploy Commands

### One-Click Deploy
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy everything
./scripts/deploy-backend.sh
./scripts/build-mobile.sh
```

### Manual Deploy Steps
```bash
# 1. Push to main branch
git push origin main

# 2. GitHub Actions will automatically:
#    - Test all code
#    - Build Docker image
#    - Deploy to ECS
#    - Deploy frontend to Vercel
#    - Build mobile apps

# 3. Monitor deployment
aws ecs describe-services --cluster watchhere-cluster --services watchhere-backend
```

## 7. Production Checklist

### Security
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable AWS WAF
- [ ] Rotate JWT secrets

### Performance
- [ ] Enable CloudFront CDN
- [ ] Configure S3 bucket policies
- [ ] Set up database indexes
- [ ] Enable gzip compression
- [ ] Configure auto-scaling

### Monitoring
- [ ] Set up CloudWatch alarms
- [ ] Configure error tracking
- [ ] Enable access logs
- [ ] Set up uptime monitoring
- [ ] Configure backup strategy

## 8. Rollback Strategy

### Quick Rollback
```bash
# Rollback ECS service
aws ecs update-service --cluster watchhere-cluster --service watchhere-backend --task-definition watchhere-backend:PREVIOUS_REVISION

# Rollback Vercel
vercel --prod --target production
```

### Database Backup
```bash
# MongoDB Atlas backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/watchhere"

# Restore if needed
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/watchhere" dump/
```

## 🎯 Production URLs

- **Frontend**: https://watchhere.vercel.app
- **Backend API**: https://api.watchhere.com
- **Admin Panel**: https://watchhere.vercel.app/admin
- **Mobile Apps**: Available on App Store & Google Play

Total deployment time: ~30 minutes with automation