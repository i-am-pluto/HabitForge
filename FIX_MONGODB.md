# Fix MongoDB Connection

The app is showing `MongoDB connection failed, using in-memory storage: bad auth : authentication failed` because your MongoDB Atlas connection string is not properly configured.

## Quick Fix Options:

### Option 1: Use In-Memory Storage (Works Immediately)
The app automatically falls back to in-memory storage when MongoDB fails. This means:
- ✅ App works perfectly right now
- ✅ You can create, update, and delete habits
- ❌ Data doesn't persist between server restarts

### Option 2: Set Up MongoDB Atlas (Persistent Storage)

1. **Create MongoDB Atlas Account** (Free):
   - Go to https://cloud.mongodb.com
   - Create free account and M0 cluster

2. **Get Connection String**:
   - In your cluster, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Your Environment**:
   - In Replit, go to Secrets tab
   - Update `MONGODB_URI` with your connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`

4. **Common Issues**:
   - Password contains special characters? URL encode them
   - IP not whitelisted? Allow access from anywhere (0.0.0.0/0)
   - Wrong database name? Use any name, it will be created automatically

## Connection String Examples:

**Working format:**
```
mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/habits?retryWrites=true&w=majority
```

**With special characters in password:**
```
mongodb+srv://myuser:my%40password@cluster0.abcde.mongodb.net/habits?retryWrites=true&w=majority
```

## Test Your Connection:
After updating MONGODB_URI, restart the app. You should see:
- "Connected to MongoDB" instead of "using in-memory storage"
- Data persists between server restarts