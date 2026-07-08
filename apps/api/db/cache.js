import { createClient } from 'redis';
import 'dotenv/config';

export const redis = createClient({
    username: process.env.REDIS_USERNAME, //REDIS_USERNAME
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST, //REDIS_HOST
        port: process.env.REDIS_PORT //REDIS_PORT
    }
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
  // Attempt to reconnect
  setTimeout(async () => {
    try {
      await redis.connect();
      console.log('Redis reconnected successfully');
    } catch (reconnectErr) {
      console.error('Redis reconnection failed', reconnectErr);
    }
  }, 5000); // Retry after 5 seconds
});

await redis.connect();



