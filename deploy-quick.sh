#!/bin/bash

# Quick deployment script - minimal version
echo "Deploying to production..."

npm run build && vercel --prod --confirm

echo "Deployment complete!"