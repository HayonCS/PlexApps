/*eslint-disable @typescript-eslint/no-unused-vars*/

import { CacheStore, LocalCache } from "../types";

/** A `CacheStore` that effectively disables caching. Not used, and could be out of date.*/
export const NO_CACHE: CacheStore = {
  async get(this: LocalCache, key: string): Promise<string | null> {
    return null;
  },

  async set(this: LocalCache, key: string, value: string, ttlMs: number): Promise<any> {
    return;
  },

  async clearValues(pattern: string): Promise<void> {
    return;
  },
};
