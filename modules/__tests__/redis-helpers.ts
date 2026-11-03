import IORedis from "ioredis";
import * as config from "config";

export const redisClear = async () => {
  config.get("redis.url");
  const _redis = new IORedis(config.get("redis.url"));

  await _redis.flushdb();
};

export const redisSetupBeforeEach = async () => {
  await redisClear();

  config.get("redis.url");
  const _redis = new IORedis(config.get("redis.url"));

  //Setup scratch user settings.
  const userSettings = {
    DarkMode: {
      description: "Enables the Dark Mode app theme.",
      iconName: "dark_mode",
      label: "Dark Mode",
      settingType: "SwitchType",
      tooltip: "Enable Dark Mode.",
      value: false,
    },
    DefaultDisplayFormat: {
      description: "The default display format of the memory map grid.",
      iconName: "text_format",
      label: "Default Format",
      placeholder: "Format",
      selections: ["HEXADECIMAL", "BINARY", "ASCII", "DECIMAL"],
      settingType: "SelectType",
      tooltip: "Default Display Format.",
      value: "DECIMAL",
    },
  };

  const recentMemoryMaps = [
    {
      memoryMapName: "305-0195-000",
      bomRevision: "BBB",
      version: 4,
      lastAccessed: "2025-14-11T12:00:00Z",
    },

    {
      memoryMapName: "305-1111-000",
      bomRevision: "BBA",
      version: 3,
      lastAccessed: "2025-14-11T3:00:00Z",
    },

    {
      memoryMapName: "305-1234-000",
      bomRevision: "CCC",
      version: 4,
      lastAccessed: "2025-14-11T6:00:00Z",
    },
  ];

  const userName = "bill.brasky";
  await _redis.set(`userSettings:${userName}`, JSON.stringify(userSettings));

  for (const memoryMap of recentMemoryMaps) {
    await _redis.lpush(`recentmemorymaps:${userName}`, JSON.stringify(memoryMap));
  }

  await _redis.quit();
};
