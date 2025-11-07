const { Pool } = require('pg');

// Database configuration
const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'ai_interview_trainer',
  password: 'Sai@123456',
  port: 5432,
};

// Create connection pool
const pool = new Pool(config);

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database pool connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Export the pool
module.exports = pool;
