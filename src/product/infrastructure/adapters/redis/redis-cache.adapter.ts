import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CachePort } from '../../../domain/ports/cache.port';

@Injectable()
export class RedisCacheAdapter
  implements CachePort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private client: Redis;
  private readonly defaultTTL: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTTL = this.configService.get<number>('REDIS_TTL', 3600); // 1 hora por defecto
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const host = this.configService.get<string>('REDIS_HOST', 'localhost');
      const port = this.configService.get<number>('REDIS_PORT', 6379);
      const password = this.configService.get<string>('REDIS_PASSWORD');

      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('error', (err) => {
        this.logger.error(`Redis Client Error: ${err.message}`);
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.client.on('ready', () => {
        this.logger.log(`Redis ready at ${host}:${port}`);
      });

      this.client.on('close', () => {
        this.logger.warn('Redis connection closed');
      });

      await this.client.ping();
      this.logger.log(`Successfully connected to Redis at ${host}:${port}`);
    } catch (error) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`);
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.logger.log('Disconnected from Redis');
      }
    } catch (error) {
      this.logger.error(`Error disconnecting from Redis: ${error.message}`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);

      if (!value) {
        this.logger.debug(`Cache miss for key: ${key}`);
        return null;
      }

      this.logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}: ${error.message}`);
      return null; // Fail gracefully
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const ttl = ttlSeconds ?? this.defaultTTL;

      await this.client.setex(key, ttl, serialized);
      this.logger.debug(`Cache set for key: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}: ${error.message}`);
      // No lanzar error, solo log (fail gracefully)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache key ${key}: ${error.message}`);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushdb();
      this.logger.warn('Redis cache cleared (all keys deleted)');
    } catch (error) {
      this.logger.error(`Error clearing cache: ${error.message}`);
    }
  }

  /**
   * Método auxiliar para generar keys consistentes
   */
  static generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Verificar si Redis está disponible
   */
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }
}
