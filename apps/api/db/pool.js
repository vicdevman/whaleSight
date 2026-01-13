// src/config/db.js
import { neon } from '@neondatabase/serverless';
import { createRetryPool } from './retry.js';
import 'dotenv/config';

const basePool = neon(process.env.DATABASE_URL, {
  fetchOptions: {
    timeout: 10000, // 10 second timeout to prevent hanging connections
  },
});

// Wrap pool with automatic retry logic for serverless environments
const pool = createRetryPool(basePool);

// Test connection
(async () => {
  try {
    const result = await pool`SELECT NOW()`;
    console.log("✅ Neon DB connected successfully at:", result[0].now);
  } catch (err) {
    console.error("❌ Neon DB connection error:", err.message);
  }
})();

export default pool;
