import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';

const isLocal = env.REDIS_HOST === 'localhost' || env.REDIS_HOST === '127.0.0.1';

export const redisConfig: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  // Add SSL/TLS configuration for secure remote hosts (like Upstash)
  ...(isLocal ? {} : { tls: { rejectUnauthorized: false } }),
};

// Create a reusable Redis connection instance for general use if needed
let redisInstance: Redis | null = null;

export function getRedisInstance(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(redisConfig);
    redisInstance.on('connect', () => {
      console.log(`[Redis] Connected to ${env.REDIS_HOST}:${env.REDIS_PORT}`);
    });
    redisInstance.on('error', (err) => {
      console.error('[Redis] Connection error:', err);
    });
  }
  return redisInstance;
}
