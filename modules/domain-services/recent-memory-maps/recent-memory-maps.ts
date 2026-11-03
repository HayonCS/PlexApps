import * as redis from "db/redis";

export type RecentMemoryMap = {
  memoryMapName: String;
  bomRevision: String;
  version: number;
  lastAccessed: String;
};

export type RecentMemoryMapsResponse = {
  recentMemoryMaps: RecentMemoryMap[];
};

export async function getRecentMemoryMaps(userName: string): Promise<RecentMemoryMapsResponse> {
  const redisInstance = redis.getRedisPubConnection();
  const recentMemoryMaps = await redisInstance.lrange("recentmemorymaps:" + userName, 0, 4);

  var recentMemoryMapsResponse: RecentMemoryMapsResponse = {
    recentMemoryMaps: [],
  };

  recentMemoryMaps.forEach((value) => {
    const jsonValues = JSON.parse(value);
    const memoryMapResponse: RecentMemoryMap = {
      memoryMapName: jsonValues["memoryMapName"],
      bomRevision: jsonValues["bomRevision"],
      version: jsonValues["version"],
      lastAccessed: jsonValues["lastAccessed"] || new Date(0).toISOString(),
    };

    recentMemoryMapsResponse.recentMemoryMaps.push(memoryMapResponse);
  });

  return recentMemoryMapsResponse;
}

export async function saveRecentMemoryMapForUser(
  userName: String,
  memoryMapName: String,
  bomRevision: String,
  version: number
): Promise<RecentMemoryMapsResponse> {
  const redisInstance = redis.getRedisPubConnection();
  const keyValue = "recentmemorymaps:" + userName;

  const memoryMapToSave: RecentMemoryMap = {
    memoryMapName: memoryMapName,
    bomRevision: bomRevision,
    version: version,
    lastAccessed: Date(),
  };

  // Check if this memory map already exists in the list (with any lastAccessed time)
  const savedMemoryMaps = await redisInstance.lrange(keyValue, 0, 4);

  const existingMemoryMap = savedMemoryMaps.find((memoryMap) => {
    const decoded = JSON.parse(memoryMap);
    if (decoded.memoryMapName === memoryMapName && decoded.bomRevision === bomRevision && decoded.version === version) {
      return decoded;
    }
  });

  if (existingMemoryMap) {
    // Memory map already exists in list, remove it and add updated version to the front
    await redisInstance.lrem(keyValue, 0, existingMemoryMap);
    await redisInstance.lpush(keyValue, JSON.stringify(memoryMapToSave));
  } else {
    // New memory map, check if we need to remove the oldest entry
    if (savedMemoryMaps.length >= 5) {
      await redisInstance.rpop(keyValue);
    }
    await redisInstance.lpush(keyValue, JSON.stringify(memoryMapToSave));
  }
  //Get the new list and return.
  const newList = await redisInstance.lrange(keyValue, 0, 4);

  const recentMemoryMaps = newList.map((value): RecentMemoryMap => {
    const jsonValues = JSON.parse(value);
    const memoryMapResponse: RecentMemoryMap = {
      memoryMapName: jsonValues["memoryMapName"],
      bomRevision: jsonValues["bomRevision"],
      version: jsonValues["version"],
      lastAccessed: jsonValues["lastAccessed"] || Date(),
    };

    return memoryMapResponse;
  });

  return { recentMemoryMaps };
}

export async function clearRecentMemoryMaps(userName: string): Promise<boolean> {
  const redisInstance = redis.getRedisPubConnection();
  const keyValue = "recentmemorymaps:" + userName;
  await redisInstance.del(keyValue);
  return true;
}
