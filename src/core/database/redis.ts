import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

class RedisService {
  private client: Redis | null = null;
  private memoryCache: Map<string, { value: string; expiresAt: number }> = new Map();

  constructor() {
    if (redisUrl) {
      try {
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
        this.client.on('error', (err) => {
          console.warn('Redis connection error, falling back to memory cache:', err.message);
        });
      } catch (err) {
        console.warn('Failed to initialize Redis client, falling back to memory cache.');
      }
    } else {
      console.warn('REDIS_URL not configured. Using local in-memory fallback cache.');
    }
  }

  /**
   * Retrieves a value from cache.
   */
  public async get(key: string): Promise<string | null> {
    if (this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // Fallback to memory
      }
    }
    
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return cached.value;
  }

  /**
   * Sets a value in cache with an expiration time in seconds.
   */
  public async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (this.client) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // Fallback to memory
      }
    }
    
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });
  }

  /**
   * Acquires a lightweight distributed lock.
   */
  public async acquireLock(lockKey: string, ttlMs = 5000): Promise<boolean> {
    if (this.client) {
      try {
        const acquired = await this.client.set(lockKey, 'locked', 'PX', ttlMs, 'NX');
        return acquired === 'OK';
      } catch {
        // Fallback to memory
      }
    }

    const key = `lock:${lockKey}`;
    const cached = this.memoryCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return false;
    }
    this.memoryCache.set(key, { value: 'locked', expiresAt: Date.now() + ttlMs });
    return true;
  }

  /**
   * Releases a distributed lock.
   */
  public async releaseLock(lockKey: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(lockKey);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memoryCache.delete(`lock:${lockKey}`);
  }

  /**
   * Get raw client for BullMQ or Pub/Sub.
   */
  public getClient(): Redis | null {
    return this.client;
  }
}

export const RedisConn = new RedisService();
export type { RedisService };
