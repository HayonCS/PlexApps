/**
 * Type-aware caching algorithm
 *
 * Implements the algorithm discussed here:
 * https://spin.atomicobject.com/2018/02/12/coordinated-cache-refill-redis-node/
 *
 * The `Cache` type has a `get` argument that can define either singleton cache
 * entries or families of entries whose key is derived from an argument.
 */

import * as Hexagonal from "atomic-object/hexagonal";

import { CachePort, CacheStorePort } from "./ports";
import { addMsToDate, msBetween, sleep } from "./utils";

import { RedisCacheStore } from "./stores/redis";
import { CacheStore } from "./types";
import { RedisPrefixPort } from "modules/context/ports";

/** Used to split the stored payload string into constituent elements. */
const SEPARATOR = "\u0000";

/** Represents a single cache value identified by `key` */
export interface Singleton<T> {
  readonly key: string;
  readonly func: () => Promise<T>;
  readonly settings: CacheOpts;
}

/** Represents a family of cached values whose individual entries
 * can have a key derived via `cacheKeyFn`. Useful when you have a
 * unique identifier, such as database id, that you want to remember
 * instances of a type via.
 */
export interface Family<A, T> {
  readonly key: string;
  readonly func: (args: A) => Promise<T>;
  readonly cacheKeyFn: (args: A) => string;
  readonly settings: CacheOpts;
}

/** Defines a `Family` whose `cacheKeyFn` just stringifies the input. This
 * is mainly useful when you wish to have a cache backed by a string or number
 * id.
 */
export function fromStringableArg<A extends string | number | boolean | null | undefined, T>(
  spec: Pick<Family<A, T>, Exclude<keyof Family<A, T>, "cacheKeyFn">>
): Family<A, T> {
  return Object.assign({}, spec, {
    cacheKeyFn: String,
  });
}

/** Provides the cache algorithm configured with a `CacheStore` */
export class Cache {
  /**
   * Build a Cache
   *
   * @param store The object used to store values. See `./stores`. Usually redis.
   */
  constructor(public readonly store: CacheStore) {}

  /** Get an entry from cache or compute, cache, and return it on a cache miss */
  get<T>(spec: Singleton<T>): Promise<T>;
  get<A, T, P extends A>(spec: Family<A, T>, args: P): Promise<T>;
  get(spec: any, args?: any): Promise<any> {
    const key = spec.cacheKeyFn ? `${spec.key}:${spec.cacheKeyFn(args)}` : spec.key;
    return rawLookupOrFill(this.store, key, () => spec.func(args), spec.settings);
  }

  /** Clear a cache entry. */
  async clear<A, T, P extends A>(spec: Family<A, T>, args?: P): Promise<void> {
    const pattern = args ? `${spec.key}:${spec.cacheKeyFn(args)}*` : `${spec.key}*`;

    await this.store.clearValues(pattern);
  }
}

/** The core caching algorithm. */
export async function rawLookupOrFill<T>(
  store: CacheStore,
  key: string,
  func: () => Promise<T>,
  settings: CacheOpts
): Promise<T> {
  const cacheKey = key;
  let effectivePayload = await readPayload(store, cacheKey);
  if (effectivePayload) {
    const now = new Date();
    // If the minimum age has expired
    if (now > effectivePayload.nextCheckTime) {
      const ticket = drawTicket();
      const currentAge = msBetween(effectivePayload.createdAt, now);
      const timeUntilEntryIsInvalid = Math.max(settings.maxAgeMs - currentAge, 1);

      // Advance minimum age by grace period so other processes don't retry.
      const nextCheckTime = addMsToDate(now, settings.graceMs);

      // Put current value back in cache with a new min age and our ticket.
      await writePayload(
        store,
        cacheKey,
        {
          ticket: ticket,
          createdAt: effectivePayload.createdAt,
          nextCheckTime,
          jsonValue: effectivePayload.jsonValue,
        },
        timeUntilEntryIsInvalid
      );

      // Wait for others to do the same.
      await sleep(25);

      // See what's in the cache
      effectivePayload = (await readPayload(store, cacheKey)) || effectivePayload;

      // If our ticket matches what's in redis, then it's our job to recompute the value.
      if (effectivePayload.ticket === ticket) {
        if (cacheKey !== "help_wiki") {
          console.info(`🎁 Async cache refill for ${cacheKey}`);
        }

        // Don't care about the return value, but avoid errors of unhandled promises
        void fillCache();
        // reuse existing payload
      }
    }
  } else {
    effectivePayload = await fillCache();
  }

  return JSON.parse(effectivePayload.jsonValue);

  async function fillCache(): Promise<Payload> {
    let value = await func();
    if (value === undefined) {
      value = null as any;
    }
    const now = new Date();
    const payload: Payload = {
      createdAt: now,
      nextCheckTime: addMsToDate(now, settings.minAgeMs),
      ticket: -1,
      jsonValue: JSON.stringify(value),
    };

    if (value) {
      // Only cache truthy (non-null, non-undefined output)
      await writePayload(store, cacheKey, payload, settings.maxAgeMs);
    }

    return payload;
  }
}

export type CacheOpts = {
  /** How long before a cached value will attempt to be recomputed while still being valid. */
  minAgeMs: number;
  /** Beyond this age, a cached value is invalid and should never be used. TTL */
  maxAgeMs: number;
  /** Should be at least the maximum length it could take to compute the value. If this is too short, multiple processes could theoretically recompute the cache, which is an unlikely, minor performance issue in most cases. */
  graceMs: number;
};

/** Generate an identifier for this process to tell decide if it is our responsibility to refill the cache. */
function drawTicket() {
  return Math.floor(Math.random() * 2000000000);
}

/** The structure stored in `CacheStore` */
export interface Payload {
  /** The identifier of the process responsible for refilling the cache, or `-1` when the cache entry is not being recomputed. */
  ticket: number;
  /** The time this entry was created */
  createdAt: Date;
  /** The time this entry should be recomputed due to `minAgeMs` expiring or a recomputation of the value surpassing `graceMs`. */
  nextCheckTime: Date;
  /** The JSON representation of the cached value. */
  jsonValue: string;
}

export function payloadToString(opts: Payload) {
  return [opts.ticket.toString(), opts.createdAt.valueOf(), opts.nextCheckTime.valueOf(), opts.jsonValue].join(
    SEPARATOR
  );
}

export function stringToPayload(cacheString: string): Payload | null {
  const entries = cacheString.split(SEPARATOR);
  if (entries.length !== 4) {
    return null;
  }

  const [winner, createdAt, nextCheckTime, jsonValue] = entries;
  return {
    ticket: parseInt(winner, 10),
    createdAt: new Date(parseInt(createdAt, 10)),
    nextCheckTime: new Date(parseInt(nextCheckTime, 10)),
    jsonValue: jsonValue,
  };
}

export async function readPayload(store: CacheStore, key: string): Promise<Payload | null> {
  const cacheString: string | null = await store.get(key);
  const payload = cacheString === null || cacheString === undefined ? null : stringToPayload(cacheString);
  return payload;
}

export async function writePayload(store: CacheStore, key: string, payload: Payload, ttlMs: number): Promise<any> {
  await store.set(key, payloadToString(payload), ttlMs);
}

export const cacheStoreAdapter = Hexagonal.adapter({
  port: CacheStorePort,
  requires: [RedisPrefixPort],
  build: (ctx) => {
    const cachePrefix = `${ctx.get(RedisPrefixPort)}cache:`;
    return new RedisCacheStore(cachePrefix);
  },
});

export const cacheAdapter = Hexagonal.adapter({
  port: CachePort,
  requires: [CacheStorePort],
  build: (ctx) => {
    return new Cache(ctx.get(CacheStorePort));
  },
});
