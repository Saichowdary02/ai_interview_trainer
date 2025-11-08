const { Pool } = require('pg');

// Database configuration - use environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  process.exit(1);
}

// Create connection pool
const pool = new Pool({
  connectionString,
  // When using cloud Postgres (Neon) ensure TLS; accept self-signed if needed:
  ssl: connectionString && connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database pool connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Export the pool
module.exports = pool;
