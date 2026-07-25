const mongoose = require('mongoose');

const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-pds';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
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
      console.log(`[In-Memory MongoDB Connected Successfully]: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[In-Memory MongoDB Failed]: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
