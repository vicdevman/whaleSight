import pkg from "pg";
const { Pool } = pkg;
import 'dotenv/config'

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1); // Exit the process to avoid undefined behavior
});

async function testConnection() {
  try {
    const res = await db.connect();
    console.log(`DATABASE CONNECTED !!!`);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
}

testConnection();
