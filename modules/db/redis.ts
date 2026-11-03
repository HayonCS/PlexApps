import * as IORedis from "ioredis";
import config from "config";

// declare function getRedisConnection(): Redis;
let _redis: IORedis.Redis | null = null;
let _redisSub: IORedis.Redis | null = null;

export function getRedisPubConnection() {
  if (!_redis) {
    _redis = new IORedis.Redis(config.get("redis.url"));
  }
  return _redis;
}

export async function destroyPubConnection() {
  if (_redis) {
    await _redis.disconnect();
    // eslint-disable-next-line require-atomic-updates
    _redis = null;
  }
  return _redis;
}

export function getRedisSubConnection() {
  if (!_redisSub) {
    _redisSub = new IORedis.Redis(config.get("redis.url"));
  }
  return _redisSub;
}

export async function destroySubConnection() {
  if (_redisSub) {
    await _redisSub.disconnect();
    // eslint-disable-next-line require-atomic-updates
    _redisSub = null;
  }
  return _redisSub;
}

export function getRedisConnection() {
  return getRedisPubConnection();
}

export async function destroyConnection() {
  return destroyPubConnection();
}
