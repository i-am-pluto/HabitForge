# MongoDB Atlas Setup Guide

## Quick Setup Steps

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. Create a New Cluster
1. After login, click "Create" or "Build a Cluster"
2. Choose "M0 Sandbox" (FREE tier)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "Cluster0")
5. Click "Create Cluster" (takes 1-3 minutes)

### 3. Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username (e.g., "habituser") and a strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development)
   - Or add your specific IP address for better security
4. Click "Confirm"

### 5. Get Connection String
1. Go back to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<database>` with your database name (e.g., "habitsdb")

### Example Connection String
```
mongodb+srv://habituser:yourpassword@cluster0.abcde.mongodb.net/habitsdb?retryWrites=true&w=majority
```

## Common Issues & Solutions

### Authentication Failed
- Double-check your username and password in the connection string
- Ensure the database user has proper permissions
- Make sure there are no special characters that need URL encoding

### Connection Timeout
- Check your network access settings in MongoDB Atlas
- Ensure your IP address is whitelisted
- Try allowing access from anywhere (0.0.0.0/0) for testing

### Database Not Found
- The database will be created automatically when you first write data
- Make sure the database name in your connection string matches what you want

## URL Encoding Special Characters

If your password contains special characters, you need to URL encode them:

| Character | URL Encoded |
|-----------|-------------|
| @         | %40         |
| :         | %3A         |
| /         | %2F         |
| ?         | %3F         |
| #         | %23         |
| [         | %5B         |
| ]         | %5D         |
| %         | %25         |

## Security Best Practices

1. **Use strong passwords** with a mix of letters, numbers, and symbols
2. **Limit network access** to specific IP addresses when possible
3. **Use separate users** for different applications
4. **Regular monitoring** of database access logs
5. **Enable two-factor authentication** on your MongoDB Atlas account

## Testing Your Connection

Once you have your connection string:
1. Add it to your Replit Secrets as `MONGODB_URI`
2. Restart your application
3. Try creating a new habit to test the connection
4. Check the console logs for any connection errors