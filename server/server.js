const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error.middleware');
const User = require('./src/models/User');
const { seedData } = require('./seed/seed');

dotenv.config();

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, error: 'Too many login/registration attempts, please try again after 15 minutes.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Public Distribution System (Smart PDS) API',
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Public Distribution System (Smart PDS) API',
    timestamp: new Date()
  });
});

// Middleware to ensure DB connection on serverless requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    try {
      await connectDB();
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await seedData(false);
      }
    } catch (err) {
      console.error('DB Middleware Connection Error:', err.message);
      return res.status(503).json({
        success: false,
        error: `Database connection error: ${err.message}`
      });
    }
  }
  next();
});

// Mounting Domain Routers
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/distributor', require('./src/routes/distributor.routes'));
app.use('/api/distributor/epos', require('./src/routes/epos.routes'));
app.use('/api/distributor', require('./src/routes/payment.routes'));
app.use('/api/consumer', require('./src/routes/consumer.routes'));
app.use('/api/consumer', require('./src/routes/slot.routes'));
app.use('/api/consumer', require('./src/routes/complaint.routes'));

// Global Error Handler
app.use(errorHandler);

let PORT = process.env.PORT || 5000;

const startServer = (portToTry) => {
  const server = app.listen(portToTry, () => {
    console.log(`====================================================`);
    console.log(`  Smart PDS Server running on port: ${portToTry}`);
    console.log(`  API Base URL: http://localhost:${portToTry}/api`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Port ${portToTry} is in use, trying port ${portToTry + 1}...]`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB().then(async () => {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-seeding empty database with demo data...]');
      await seedData(false);
    }
    startServer(Number(PORT));
  });
}

module.exports = app;
