#!/bin/bash

# Build and push Docker image
docker build -t watchhere-backend ./backend
docker tag watchhere-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/watchhere:latest

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Push image
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/watchhere:latest

# Update ECS service
aws ecs update-service --cluster watchhere-cluster --service watchhere-backend --force-new-deployment