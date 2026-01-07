import { createClient } from 'redis';

export const client = createClient({
    username: 'default',
    password: '1417Ta5VkhdxugVTSS8VPdM2GtNulgjH',
    socket: {
        host: 'redis-15500.c9.us-east-1-2.ec2.cloud.redislabs.com',
        port: 15500
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();



