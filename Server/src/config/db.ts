import env from '@/config/env.js';
import mongoose from 'mongoose';

// Disable buffering globally in production to prevent memory leaks and thundering herd issues
// when the database connection is offline or recovering.
mongoose.set('bufferCommands', env.NODE_ENV !== 'production');

// Connection Event Listeners
// Mongoose auto-reconnects on network issues, but without these
// listeners you'd never know when connections drop or recover.
// Register once at module load — not inside connectDB().

mongoose.connection.on('connected', () => {
  console.log('📗 MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  console.warn('📕 MongoDB disconnected');
});

mongoose.connection.on('error', (err: Error) => {
  console.error('📛 MongoDB connection error:', err.message);
});

async function connectDB(): Promise<void> {
  // Only skip if fully connected (readyState 1).
  // If it is connecting (readyState 2), we should still await mongoose.connect()
  // so that the caller waits until the connection is fully established.
  if (mongoose.connection.readyState === 1) return;

  // Don't try-catch here — let the error propagate to server.ts
  // where it will be caught and trigger process.exit(1).
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production', // Disable auto-indexing in production for performance
    serverSelectionTimeoutMS: 5000, // Fail fast (5s instead of default 30s) if DB is down
  });
}

export default connectDB;
