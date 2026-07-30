const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async (uri) => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-pds';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log(`[Local MongoDB Not Found (${error.message}) -> Starting In-Memory MongoDB Server...]`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'smart-pds'
        }
      });
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      isConnected = true;
      console.log(`[In-Memory MongoDB Connected Successfully]: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[In-Memory MongoDB Failed]: ${memErr.message}`);
      // Return fallback without crashing
    }
  }
};

module.exports = connectDB;
