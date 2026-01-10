import pkg from "pg";
const { Pool } = pkg;
import 'dotenv/config'

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Timeout after 5 seconds if connection cannot be established
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function testConnection() {
  let client;
  try {
    client = await db.connect();
    console.log(`DATABASE CONNECTED !!!`);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  } finally {
    if (client) {
        client.release();
    }
  }
}

testConnection();
