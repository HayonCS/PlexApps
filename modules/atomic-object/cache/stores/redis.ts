import * as zlib from "zlib";

import { getRedisPubConnection } from "db/redis";
import { CacheStore } from "../types";

/**
 * A `CacheStore` implementation that stores entries as gzipped values in
 * Redis. Trades compute time in the web tier for reduced memory pressure
 * in the cache.
 */
export class RedisCacheStore implements CacheStore {
  constructor(public readonly keyPrefix: string) {}

  async get(key: string): Promise<string | null> {
    key = `${this.keyPrefix}${key}`;
    const redis = getRedisPubConnection();
    const cacheString: Buffer | null = await redis.getBuffer(key);
    if (!cacheString) {
      return cacheString;
    }
    return new Promise<string | null>((resolve) => {
      zlib.gunzip(cacheString, (err, res) => {
        if (err) {
          resolve(null);
        } else {
          resolve(res.toString("utf8"));
        }
      });
    });
  }

  async set(key: string, value: string, ttlMs: number): Promise<any> {
    key = `${this.keyPrefix}${key}`;
    const redis = getRedisPubConnection();
    return new Promise<string | null>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      zlib.gzip(value, async (err, compressed) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const response = await redis.set(key, compressed, "PX", ttlMs);
          resolve(response);
        } catch (e) {
          reject(e);
          return;
        }
      });
    });
  }

  async clearValues(pattern: string): Promise<void> {
    pattern = `${this.keyPrefix}${pattern}`;
    const redis = getRedisPubConnection();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
