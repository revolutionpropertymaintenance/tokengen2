const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Connect to PostgreSQL
const connectDB = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    console.log(`PostgreSQL Connected: ${client.database} on ${client.host}`);
    client.release();
    
    // Initialize database if needed
    await initializeDatabase();
    
    return pool;
  } catch (error) {
    console.error(`Error connecting to PostgreSQL: ${error.message}`);
    // Retry logic with exponential backoff
    console.log('Retrying connection in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
};

// Initialize database tables if they don't exist
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('Database schema initialized');
    }
    
    client.release();
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
    throw error;
  }
};

// Query helper with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
};

module.exports = {
  connectDB,
  query,
  pool
};