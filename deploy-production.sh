#!/bin/bash

echo "🚀 WatchHere Production Deployment"
echo "=================================="

# Check prerequisites
echo "Checking prerequisites..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker not running. Start Docker Desktop."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Install with: npm install -g @expo/eas-cli"
    exit 1
fi

echo "✅ All prerequisites met"
echo ""

# 1. Deploy Backend to AWS ECS
echo "1. Deploying Backend to AWS ECS..."
cd backend

# Build Docker image
echo "Building Docker image..."
docker build -t watchhere-backend .

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
ECR_REPOSITORY="watchhere-backend"

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Tag and push image
docker tag watchhere-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Update ECS service
aws ecs update-service --cluster watchhere-cluster --service watchhere-backend --force-new-deployment --region $AWS_REGION

echo "✅ Backend deployed to AWS ECS"
echo "Backend URL: http://watchhere-backend-alb-123456789.us-east-1.elb.amazonaws.com"
echo ""

# 2. Deploy Frontend to Vercel
echo "2. Deploying Frontend to Vercel..."
cd ../frontend

# Deploy to production
vercel --prod --yes

echo "✅ Frontend deployed to Vercel"
echo "Frontend URL: https://watchhere-platform.vercel.app"
echo ""

# 3. Build Mobile Apps
echo "3. Building Mobile Apps..."
cd ../mobile

# Login to Expo (if not already logged in)
eas whoami || eas login

# Build for both platforms
echo "Building Android APK..."
eas build --platform android --profile production --non-interactive

echo "Building iOS IPA..."
eas build --platform ios --profile production --non-interactive

echo "✅ Mobile apps building (check Expo dashboard for progress)"
echo "Expo Dashboard: https://expo.dev"
echo ""

# 4. Run post-deployment tests
echo "4. Running post-deployment tests..."
cd ..

# Test backend health
echo "Testing backend health..."
BACKEND_URL="http://watchhere-backend-alb-123456789.us-east-1.elb.amazonaws.com"
curl -f $BACKEND_URL/health || echo "⚠️  Backend health check failed"

# Test frontend
echo "Testing frontend..."
FRONTEND_URL="https://watchhere-platform.vercel.app"
curl -f $FRONTEND_URL || echo "⚠️  Frontend health check failed"

echo ""
echo "🎉 Production Deployment Complete!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "Mobile:   Building on Expo (check dashboard)"
echo ""
echo "🔧 Next Steps:"
echo "1. Update DNS records to point to production URLs"
echo "2. Configure SSL certificates"
echo "3. Set up monitoring and alerts"
echo "4. Submit mobile apps to app stores"
echo ""
echo "📱 Mobile App Submission:"
echo "eas submit --platform android --profile production"
echo "eas submit --platform ios --profile production"