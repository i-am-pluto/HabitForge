# Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy
1. Click the "Deploy to Vercel" button in the README
2. Connect your GitHub account
3. Add your MongoDB Atlas connection string as `MONGODB_URI`
4. Deploy!

### Option 2: Manual Deployment

#### Step 1: Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free account
2. Create a new project and cluster (choose M0 free tier)
3. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose password authentication
   - Set username and password
4. Whitelist your IP or allow access from anywhere:
   - Go to Network Access
   - Add IP Address (0.0.0.0/0 for anywhere)
5. Get your connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<database>` with your database name (e.g., `habitsdb`)

#### Step 2: Prepare Your Code
1. Fork or clone this repository
2. Make sure all your changes are committed to your repository

#### Step 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your repository
4. Configure environment variables:
   - Add `MONGODB_URI` with your MongoDB Atlas connection string
5. Click "Deploy"

#### Step 4: Verify Deployment
1. Once deployed, visit your Vercel URL
2. Try creating a new habit to test the database connection
3. Check that data persists after page reload

## Environment Variables

Make sure to set these in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habitsdb?retryWrites=true&w=majority
```

Replace:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster` with your cluster name
- `habitsdb` with your preferred database name

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check your MONGODB_URI is correctly formatted
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify your database user has read/write permissions

2. **Build Failures**
   - Make sure all dependencies are properly installed
   - Check for TypeScript errors in your code

3. **Environment Variables Not Working**
   - Redeploy after adding environment variables
   - Check spelling of MONGODB_URI exactly

### Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Test your MongoDB connection string locally first
3. Ensure your MongoDB Atlas cluster is running and accessible