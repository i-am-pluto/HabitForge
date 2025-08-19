import mongoose from 'mongoose';

// Use environment variable or fall back to a working demo connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://habituser:habitpass123@cluster0.abcdef.mongodb.net/habits?retryWrites=true&w=majority';

console.log("Using MongoDB URI:", MONGODB_URI);
// Global is used here to maintain a cached connection across hot reloads in development
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;