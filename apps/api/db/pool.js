import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

export const db = {
  async query(text, params) {
    try {
      const result = await sql.query(text, params || []); 
 
      return {
        rows: result,
        rowCount: result.length,
      };
    } catch (error) {
      console.error('Database Query Error:', error);
      throw error;
    }
  },
 
  // Mock connect() for any legacy calls
  async connect() {
    return {
      query: (text, params) => this.query(text, params),
      release: () => {}, 
    };
  },
  on: () => {}, 
};

async function testConnection() {
  try {
    const res = await sql`SELECT version()`;
    console.log(`DATABASE CONNECTED (Neon HTTP) !!! Version: ${res[0].version}`);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
}

testConnection();
