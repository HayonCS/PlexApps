import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { StyledSettingsList } from "./Settings";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { ExampleUserSettings } from "./UserSettingsDefinitions";
import { useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";
import { SelectSettingDisplay } from "./settings-components/SelectSettingDisplay";
import { SliderSettingDisplay } from "./settings-components/SliderSettingDisplay";
import { SwitchSettingDisplay } from "./settings-components/SwitchSettingDisplay";
import { TextFieldSettingDisplay } from "./settings-components/TextFieldSettingDisplay";
import { CheckboxSettingDisplay } from "./settings-components/CheckboxSettingDisplay";

const SettingsStore = configureStore({
  reducer: createRootReducer(),
  preloadedState: {
    UserSettings: {
      settings: ExampleUserSettings,
      settingsBackup: ExampleUserSettings,
      userSettingsOpen: true,
    },
  },
});

const StorybookProvider = mockProvider({
  reduxStore: SettingsStore,
  logMissingMocks: true,
});

const SettingsList: React.FC<{}> = () => {
  const userSettings = useSelector(Selectors.UserSettings.userSettings);
  const settingNames = Object.keys(userSettings);

  return (
    <StyledSettingsList>
      {settingNames.map((settingKey, index) => {
        const setting = userSettings[settingKey];
        switch (setting.settingType) {
          case "CheckboxType":
            return <CheckboxSettingDisplay key={index} settingKey={settingKey} setting={setting} />;
          case "SelectType":
            return <SelectSettingDisplay key={index} settingKey={settingKey} setting={setting} />;
          case "SliderType":
            return <SliderSettingDisplay key={index} settingKey={settingKey} setting={setting} />;
          case "SwitchType":
            return <SwitchSettingDisplay key={index} settingKey={settingKey} setting={setting} />;
          case "TextFieldType":
            return <TextFieldSettingDisplay key={index} settingKey={settingKey} setting={setting} />;
        }
      })}
    </StyledSettingsList>
  );
};

export default {
  component: SettingsList,
  title: "User Settings",
  tags: ["autodocs"],
  args: {},
  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <Story />
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {
  args: {},
};
