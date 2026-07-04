import crypto from 'crypto';
import { GatewayChatResponse } from '../domain/adapter.interface';

class GatewayCacheManager {
  private cache: Map<string, { value: GatewayChatResponse; expiresAt: number }> = new Map();

  private generateKey(payload: unknown): string {
    const serialized = JSON.stringify(payload);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Retrieves a cached response if valid and not expired.
   */
  public get(payload: unknown): GatewayChatResponse | null {
    const key = this.generateKey(payload);
    const cached = this.cache.get(key);

    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Caches a response with a given TTL in milliseconds.
   */
  public set(payload: unknown, value: GatewayChatResponse, ttlMs = 5 * 60 * 1000): void {
    const key = this.generateKey(payload);
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Invalidates all cache entries.
   */
  public clear(): void {
    this.cache.clear();
  }
}

export const CacheManager = new GatewayCacheManager();
