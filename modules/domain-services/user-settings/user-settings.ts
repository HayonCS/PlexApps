import * as redis from "db/redis";
import { UserSettings } from "modules/core/schemas/user-settings.gen";
import { buildValidator } from "modules/core/schemas";
import { DefaultUserSettings } from "modules/client/components/user-settings/UserSettingsDefinitions";
import UserSettingsSchema from "modules/core/schemas/user-settings.schema.json";

export async function saveUserSettings(userName: string, userSettings: UserSettings): Promise<boolean> {
  const connRedis = redis.getRedisPubConnection();
  const userKey = `userSettings:${userName}`;
  const documentValidator = buildValidator<UserSettings>({
    schema: UserSettingsSchema,
  });

  try {
    documentValidator.validate(userSettings);
  } catch (e) {
    console.info("Settings were rejected by the schema validator when attempting to save.", e);
    return false;
  }

  let success = await connRedis.set(userKey, JSON.stringify(userSettings));
  if (success === "OK") return true;
  return false;
}

export async function getUserSettings(userName: string): Promise<UserSettings> {
  const connRedis = redis.getRedisPubConnection();
  const userKey = `userSettings:${userName}`;
  let result = await connRedis.get(userKey);
  if (result) {
    const restoredUserSettings: UserSettings = JSON.parse(result);
    const documentValidator = buildValidator<UserSettings>({
      schema: UserSettingsSchema,
    });

    const userSettings = DefaultUserSettings;

    Object.keys(userSettings).forEach((key) => {
      if (restoredUserSettings[key]) {
        userSettings[key] = restoredUserSettings[key];
      }
    });

    try {
      documentValidator.validate(userSettings);
    } catch (e) {
      console.info("Settings were rejected by the schema validator when retrieving.", e);
      return DefaultUserSettings;
    }

    return userSettings;
  }
  return DefaultUserSettings;
}
