import pkg from "pg";
const { Pool } = pkg;
import 'dotenv/config'

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // Limit each serverless function to 1 connection
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 10000, // Wait up to 10s for connection
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
