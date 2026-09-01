const mongoose = require('mongoose');

// Disable command buffering so queries fail instantly with a clear error if DB is disconnected
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async (uri) => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    if (process.env.VERCEL) {
      throw new Error('MONGODB_URI environment variable is missing on Vercel.');
    }
    return connectMemoryDB();
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    isConnected = true;
    console.log(`[MongoDB Atlas Connected Successfully]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas Connection Failure]: ${error.message}`);
    isConnected = false;
    
    if (process.env.VERCEL) {
      throw new Error(`MongoDB Atlas Connection Failed: ${error.message}. Please check MongoDB Atlas IP Whitelist (0.0.0.0/0).`);
    }

    return connectMemoryDB();
  }
};

const connectMemoryDB = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create({
      instance: { dbName: 'rationsetu' }
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
};

module.exports = connectDB;
