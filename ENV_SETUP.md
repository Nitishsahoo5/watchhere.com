# 🔐 Environment Variables Setup

## GitHub Secrets (Required for CI/CD)

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=abc123...
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1

# Vercel Deployment
VERCEL_TOKEN=abc123...
VERCEL_ORG_ID=team_abc123
VERCEL_PROJECT_ID=prj_abc123

# Expo/EAS
EXPO_TOKEN=abc123...

# Database & Secrets
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/watchhere
JWT_SECRET=your_super_secret_key_here
```

## Backend .env (Production)

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/watchhere
JWT_SECRET=your_super_secret_key_here
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=abc123...
AWS_REGION=us-east-1
S3_BUCKET_NAME=watchhere-videos
CLOUDFRONT_URL=https://d123456.cloudfront.net
FRONTEND_URL=https://watchhere.vercel.app
```

## Frontend .env (Production)

```bash
NEXT_PUBLIC_API_URL=https://api.watchhere.com
```

## Mobile app.json (Production)

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.watchhere.com"
    }
  }
}
```

## AWS Parameter Store (Recommended)

```bash
# Store secrets in AWS Systems Manager
aws ssm put-parameter --name "/watchhere/mongodb-uri" --value "mongodb+srv://..." --type "SecureString"
aws ssm put-parameter --name "/watchhere/jwt-secret" --value "your_secret" --type "SecureString"
```

## Quick Setup Commands

```bash
# Set GitHub secrets
gh secret set AWS_ACCESS_KEY_ID --body "AKIA..."
gh secret set AWS_SECRET_ACCESS_KEY --body "abc123..."
gh secret set VERCEL_TOKEN --body "abc123..."

# Set Vercel environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.watchhere.com

# Set AWS parameters
aws ssm put-parameter --name "/watchhere/mongodb-uri" --value "$MONGODB_URI" --type "SecureString"
```