#!/bin/bash

# Production Deployment Script for Habit Tracker
set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing globally...${NC}"
    npm install -g vercel@latest
fi

# Ensure we have the latest dependencies
echo -e "${BLUE}📦 Installing/updating dependencies...${NC}"
npm ci --production=false

# Run TypeScript check
echo -e "${BLUE}🔍 Running TypeScript check...${NC}"
npm run check

# Build the application
echo -e "${BLUE}🏗️  Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

if [ ! -d "client/dist" ]; then
    echo -e "${RED}❌ Build failed - client/dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Deploy to Vercel
echo -e "${BLUE}🌐 Deploying to Vercel...${NC}"
vercel --prod --confirm

# Check deployment status
if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Post-deployment checklist:${NC}"
    echo "1. Verify your MONGODB_URI environment variable is set in Vercel dashboard"
    echo "2. Test your deployed app URL"
    echo "3. Create a test habit to verify database connectivity"
    echo "4. Check Vercel function logs if there are any issues"
    echo ""
    echo -e "${BLUE}💡 Tip: Run 'vercel --help' for more deployment options${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi