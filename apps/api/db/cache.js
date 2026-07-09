import { createClient } from 'redis';
import 'dotenv/config';

export const redis = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
        reconnectStrategy(retries) {
            console.warn(`[Redis] Connection attempt #${retries} failed. Retrying in 5 seconds...`);
            return 5000; // wait 5 seconds before retrying
        }
    }
});

redis.on('connect', () => {
  console.log('✅ Redis client connected');
});

redis.on('ready', () => {
  console.log('✅ Redis client ready');
});

redis.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

// Connect asynchronously so we don't block server startup/module imports
redis.connect().catch((err) => {
  console.error('❌ Redis initial connection error:', err);
});



