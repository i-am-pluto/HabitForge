#!/bin/bash

# Vercel deployment script for the Habit Tracker app

echo "🚀 Deploying Habit Tracker to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo "$VERCEL_TOKEN"
vercel --prod --token $VERCEL_TOKEN

echo "✅ Deployment complete!"
echo ""
echo "📝 Don't forget to:"
echo "1. Set your MONGODB_URI environment variable in Vercel dashboard"
echo "2. Visit your deployed app URL"
echo "3. Test creating a habit to verify MongoDB connection"