#!/bin/bash

# Habit Tracker - One-shot run script
echo "🚀 Starting Habit Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your MongoDB connection string"
fi

# Start the development server
echo "🌟 Starting development server..."
echo "📱 Your app will be available at: http://localhost:5000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

npm run dev