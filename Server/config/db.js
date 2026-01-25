import { MongoClient } from 'mongodb';
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/';

const client = new MongoClient(uri, {});
let db;
const collections = {};

async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db('authDB');
    collections.users = db.collection('users');
    console.log('Connected to MongoDB!');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export { client, collections, connectDB };
