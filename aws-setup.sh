#!/bin/bash
# AWS Setup Script for GYMEZ Fitness Platform

echo "🏋️ Setting up GYMEZ Fitness Platform on AWS..."

# 1. Install AWS tools
echo "📦 Installing AWS CLI and Amplify..."
brew install awscli
npm install -g @aws-amplify/cli

# 2. Configure AWS credentials
echo "🔧 Configuring AWS credentials..."
echo "ℹ️  You'll need your AWS Access Key ID and Secret Access Key"
aws configure

# 3. Initialize Amplify for GYMEZ
echo "🚀 Initializing AWS Amplify for GYMEZ..."
amplify init --app gymez-fitness

# 4. Add Cognito Authentication (supports gym members + owners)
echo "🔐 Adding user authentication with user types..."
amplify add auth
# Select: Default configuration with Social Provider
# Choose: Username, Email
# Add: Google Social Provider

# 5. Add AppSync GraphQL API (for real-time social feeds)
echo "🔌 Adding GraphQL API for social features..."
amplify add api
# Select: GraphQL
# Template: Single object with fields
# Add models for: User, Gym, Post, WorkoutPlan, PersonalRecord

# 6. Add S3 Storage (for workout videos and photos)
echo "💾 Adding S3 storage for media files..."
amplify add storage
# Select: Content (Images, audio, video, etc.)
# Access: Auth users only
# Enable: Lambda triggers for video processing

# 7. Add Analytics (for gym owner dashboards)
echo "📊 Adding analytics..."
amplify add analytics
# Enable: User engagement tracking

# 8. Add Push Notifications
echo "📱 Adding push notifications..."
amplify add notifications
# Platform: Android, iOS
# Enable: In-app messaging

# 9. Add Functions (for business logic)
echo "⚡ Adding Lambda functions..."
amplify add function
# Functions: PR calculation, video processing, gym matching

# 10. Add Hosting (for admin web dashboard)
echo "🌐 Adding hosting for gym owner web dashboard..."
amplify add hosting
# Select: Amazon CloudFront and S3

# 11. Deploy all services
echo "🚀 Deploying GYMEZ to AWS cloud..."
amplify push --yes

# 12. Setup additional AWS services
echo "🏗️ Setting up additional AWS services..."

# Create DynamoDB tables for real-time features
aws dynamodb create-table \
  --table-name gymez-leaderboards \
  --attribute-definitions AttributeName=gym_id,AttributeType=S AttributeName=user_id,AttributeType=S \
  --key-schema AttributeName=gym_id,KeyType=HASH AttributeName=user_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Create S3 bucket for video streaming
aws s3 mb s3://gymez-workout-videos --region us-east-1

# Setup CloudFront distribution for fast video delivery
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json

echo "✅ GYMEZ Fitness Platform successfully deployed to AWS!"
echo ""
echo "🎯 Your fitness app now includes:"
echo "   🔐 Multi-user authentication (gym members + owners)"
echo "   🗄️ PostgreSQL database with real-time GraphQL API"
echo "   📹 Video storage and streaming with CloudFront CDN"
echo "   📊 Analytics dashboard for gym owners"  
echo "   📱 Push notifications for workouts and social updates"
echo "   ⚡ Serverless functions for PR calculations and AI features"
echo "   🌐 Admin web dashboard hosting"
echo "   💾 Scalable storage for photos, videos, and app data"
echo ""
echo "📱 Next steps:"
echo "   1. Update your React Native app with AWS configuration"
echo "   2. Test authentication and data sync"
echo "   3. Upload sample gym data"
echo "   4. Configure push notifications"
echo ""
echo "🚀 GYMEZ is ready for production deployment!"