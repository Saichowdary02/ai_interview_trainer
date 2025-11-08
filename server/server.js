// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// Routes
const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');
const quizRoutes = require('./routes/quizzes');
const chatbotRoutes = require('./routes/chatbot');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// --------- CORS (safer) ----------
const allowedOrigin = process.env.FRONTEND_URL || '*';
const corsOptions = {
  origin: (origin, cb) => {
    console.log('CORS Check - Request origin:', origin);
    console.log('CORS Check - Allowed origin:', allowedOrigin);
    
    // Allow requests without origin (like health checks, Postman, curl)
    if (!origin) {
      console.log('CORS: Allowed - no origin');
      return cb(null, true);
    }
    
    // Allow all origins in development or if set to '*'
    if (allowedOrigin === '*') {
      console.log('CORS: Allowed - wildcard');
      return cb(null, true);
    }
    
    try {
      // Parse both URLs to extract hostnames
      const originHost = origin.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const allowedHost = allowedOrigin.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      
      console.log('CORS Check - Origin host:', originHost);
      console.log('CORS Check - Allowed host:', allowedHost);
      
      // Check for exact match or host match
      if (origin === allowedOrigin || originHost === allowedHost) {
        console.log('CORS: Allowed - match found');
        return cb(null, true);
      }
      
      // Additional check for subdomain matching (like vercel.app)
      if (allowedHost === 'vercel.app' && originHost.endsWith('.vercel.app')) {
        console.log('CORS: Allowed - vercel subdomain match');
        return cb(null, true);
      }
      
      console.log('CORS: Rejected - no match');
      return cb(null, false); // Return false instead of error for better handling
    } catch (error) {
      console.log('CORS: Error in comparison:', error.message);
      return cb(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours cache for preflight
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------- DB pool (Neon) ----------
const connectionString = process.env.DATABASE_URL || null;
if (!connectionString) {
  console.warn('WARNING: DATABASE_URL is not set. DB queries will fail.');
}
const pool = new Pool({
  connectionString,
  // When using cloud Postgres (Neon) ensure TLS; accept self-signed if needed:
  ssl: connectionString && connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Serve uploads (prod)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
// Note: Static file serving removed for separate frontend deployment on Vercel

// --------- Mount API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/chatbot', chatbotRoutes);

// --------- Health endpoint (checks DB too) ----------
app.get('/api/health', async (req, res) => {
  try {
    if (!pool) throw new Error('DB pool not configured');
    // simple quick DB check
    await pool.query('SELECT 1');
    return res.json({
      status: 'OK',
      message: 'AI Interview Trainer API is running',
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      status: 'ERROR',
      message: 'API running but DB check failed',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Serve project overview (ensure file exists)
app.get('/api/project-overview', (req, res) => {
  const file = path.resolve(__dirname, 'projectoverview.md');
  res.sendFile(file, (err) => {
    if (err) res.status(404).send('projectoverview.md not found');
  });
});

// Note: React app serving removed for separate frontend deployment on Vercel
// All routes now return JSON API responses

// Error handler (last)
app.use(errorHandler);

// --------- Start server & graceful shutdown ----------
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`❤️ Health check at http://localhost:${PORT}/api/health`);
});

// gracefully close DB pool on exit
const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    try {
      await pool.end();
      console.log('DB pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing DB pool', err);
      process.exit(1);
    }
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
