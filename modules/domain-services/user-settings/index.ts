import * as Hexagonal from "atomic-object/hexagonal";
import { UserSettingsPort } from "./port";
import { saveUserSettings, getUserSettings } from "./user-settings";
import { UserSettings } from "modules/core/schemas/user-settings.gen";

export type UserSettingsDef = {
  saveUserSettings: (userName: string, userSettings: UserSettings) => Promise<boolean>;
  getUserSettings: (userName: string) => Promise<UserSettings>;
};

export const userSettingsAdapter = Hexagonal.adapter({
  port: UserSettingsPort,
  requires: [],
  build: () => {
    return {
      saveUserSettings: async (userName: string, userSettings: UserSettings): Promise<boolean> => {
        return await saveUserSettings(userName, userSettings);
      },
      getUserSettings: async (userName: string): Promise<UserSettings> => {
        const userSettingsPromise = await getUserSettings(userName);
        return userSettingsPromise;
      },
    };
  },
});
