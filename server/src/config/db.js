const mongoose = require('mongoose');

// Disable command buffering so queries fail instantly with a clear error if DB is disconnected
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async (uri) => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-pds';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log(`[Local/Atlas MongoDB Connection Error (${error.message})`);
    
    // In serverless / Vercel environment where local DB is absent and memory server is unsupported
    if (process.env.VERCEL) {
      console.error('[Vercel Serverless]: MONGODB_URI environment variable is required.');
      throw new Error('Database connection failed. Please configure MONGODB_URI in Vercel Environment Variables.');
    }

    // Local Development Fallback to Memory Server
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        instance: { dbName: 'smart-pds' }
      });
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      isConnected = true;
      console.log(`[In-Memory MongoDB Connected Successfully]: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[In-Memory MongoDB Failed]: ${memErr.message}`);
      throw memErr;
    }
  }
};

module.exports = connectDB;
