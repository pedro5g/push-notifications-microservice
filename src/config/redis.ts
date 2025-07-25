import { Redis } from 'ioredis';
import { Logger } from '@/utils/logger';
import { env } from './env';

export class RedisConnection {
  private static instance: Redis;
  private static logger = new Logger('Redis');
  private constructor() {}

  public static async init(): Promise<void> {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new Redis({
        port: env.REDIS_PORT,
        host: env.REDIS_HOST,
        password: env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      try {
        const response = await RedisConnection.instance.ping();
        if (response === 'PONG') {
          RedisConnection.logger.info('Redis connection initialized ');
        } else {
          RedisConnection.logger.warn(
            'Ops!, unexpected connection response',
            response
          );
        }
      } catch (error) {
        RedisConnection.logger.error('Error when trying connection with redis');
        throw error;
      }
    }
  }

  public static getInstance(): Redis {
    if (!RedisConnection.instance) {
      throw new Error(
        'Please, initialize redis instance ex: [await RedisConnection.init()]'
      );
    }
    return RedisConnection.instance;
  }

  public static async disconnect(): Promise<void> {
    if (RedisConnection.instance) {
      await RedisConnection.instance.quit();
      RedisConnection.logger.info('Redis connection close');
    }
  }
}
