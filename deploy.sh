#!/bin/bash

echo "🚀 Deploying WatchHere Platform..."

# Backend to AWS ECS
echo "📦 Building backend Docker image..."
cd backend
docker build -t watchhere-backend .
docker tag watchhere-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/watchhere:latest

echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "⬆️ Pushing to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/watchhere:latest

echo "🔄 Updating ECS service..."
aws ecs update-service --cluster watchhere-cluster --service watchhere-backend --force-new-deployment

cd ..

# Frontend to Vercel
echo "🌐 Deploying frontend to Vercel..."
cd frontend
vercel --prod
cd ..

# Mobile builds
echo "📱 Building mobile apps..."
cd mobile
eas build --platform android --profile production --non-interactive
eas build --platform ios --profile production --non-interactive
cd ..

echo "✅ Deployment complete!"
echo "🔗 Frontend: https://watchhere.vercel.app"
echo "🔗 Backend: https://api.watchhere.com"