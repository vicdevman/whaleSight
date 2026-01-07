import { createClient } from 'redis';

export const client = createClient({
    username: 'default',
    password: '1417Ta5VkhdxugVTSS8VPdM2GtNulgjH',
    socket: {
        host: 'redis-15500.c9.us-east-1-2.ec2.cloud.redislabs.com',
        port: 15500
    }
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
  // Attempt to reconnect
  setTimeout(async () => {
    try {
      await client.connect();
      console.log('Redis reconnected successfully');
    } catch (reconnectErr) {
      console.error('Redis reconnection failed', reconnectErr);
    }
  }, 5000); // Retry after 5 seconds
});

await client.connect();



