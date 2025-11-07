// server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Import routes (your files)
const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');
const quizRoutes = require('./routes/quizzes');
const chatbotRoutes = require('./routes/chatbot');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Middleware
// Use FRONTEND_URL in production; default to allow all for local dev
const corsOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads (if you store uploads in repo or S3 use appropriate approach)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Serve React build only in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client/build')));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI Interview Trainer API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve project overview (ensure file exists at this path)
app.get('/api/project-overview', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'projectoverview.md'));
});

// Serve React app for all other routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
});
