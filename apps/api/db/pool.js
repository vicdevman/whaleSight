import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

// Required for Neon serverless driver to work in non-browser environments (like Node.js)
neonConfig.webSocketConstructor = ws;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 1, // Limit each serverless function to 1 connection to avoid exhaustion
  connectionTimeoutMillis: 10000, 
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function testConnection() {
  let client;
  try {
    client = await db.connect();
    console.log(`DATABASE CONNECTED (Neon WebSocket) !!!`);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  } finally {
    if (client) {
        client.release();
    }
  }
}

testConnection();
