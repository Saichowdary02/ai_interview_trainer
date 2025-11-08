require('dotenv').config({ path: './.env' });

const { Pool } = require('pg');

console.log('Database connection test...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query result:', result.rows[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Database connection test completed successfully');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Error details:', {
      code: err.code,
      severity: err.severity,
      detail: err.detail,
      hint: err.hint,
      position: err.position,
      internalPosition: err.internalPosition,
      internalQuery: err.internalQuery,
      where: err.where,
      schema: err.schema,
      table: err.table,
      column: err.column,
      dataType: err.dataType,
      constraint: err.constraint,
      file: err.file,
      line: err.line,
      routine: err.routine
    });
    
    if (pool) {
      await pool.end();
    }
    process.exit(1);
  }
}

testConnection();
