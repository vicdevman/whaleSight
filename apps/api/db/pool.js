import pkg from "pg";
const { Pool } = pkg;
import 'dotenv/config'

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }, 
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
