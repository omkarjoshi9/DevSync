import { createClient } from 'redis';
import config from './env.js';

let redisClient = null;

export const getRedisClient = async () => {
  if (!config.redis.url) {
    console.warn('Redis URL not configured, some features may not work');
    return null;
  }

  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: config.redis.url,
      // Upstash Redis uses TLS by default
      socket: {
        tls: config.redis.url.includes('upstash') || config.redis.url.includes('rediss://'),
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis reconnection failed after 10 retries');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    return null;
  }
};

export const closeRedisConnection = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
  }
};

export default getRedisClient;

