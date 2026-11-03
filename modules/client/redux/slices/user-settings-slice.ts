import { createSlice } from "@reduxjs/toolkit";
import { ActionType } from "../types";
import { State } from "../store";
import { UserSettings } from "modules/core/schemas/user-settings.gen";
import { DefaultUserSettings } from "modules/client/components/user-settings/UserSettingsDefinitions";

export type UserSettingsState = {
  settings: UserSettings;
  settingsBackup: UserSettings;
  userSettingsOpen: boolean;
};

const initialUserSettingsState: UserSettingsState = {
  settings: DefaultUserSettings,
  settingsBackup: DefaultUserSettings,
  userSettingsOpen: false,
};

export const userSettingsSlice = createSlice({
  name: "editor",
  initialState: initialUserSettingsState,
  reducers: {
    showUserSettings: (state, action) => {
      return {
        ...state,
        userSettingsOpen: action.payload,
      };
    },
    settingsLoaded: (state, action) => {
      return {
        ...state,
        settings: action.payload.settings,
      };
    },
    settingsChanged: (state, action) => {
      return {
        ...state,
        settings: {
          ...action.payload,
        },
      };
    },
  },
});

export const UserSettingsActions = userSettingsSlice.actions;
export type UserSettingsActionsType = ActionType<typeof UserSettingsActions>;

export const UserSettingsSelectors = {
  userSettings: (state: State) => state.UserSettings.settings,
  darkMode: (state: State) => state.UserSettings.settings["DarkMode"].value,
  fontSize: (state: State) => parseInt(state.UserSettings.settings["FontSize"].value.toString()),
  defaultDisplayFormat: (state: State) => state.UserSettings.settings["DefaultDisplayFormat"].value,
  userSettingsOpen: (state: State) => state.UserSettings.userSettingsOpen,
};
