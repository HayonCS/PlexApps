import * as React from "react";
import { ExampleUserSettings } from "../UserSettingsDefinitions";
import { SwitchSettingDisplay } from "./SwitchSettingDisplay";

export default {
  component: SwitchSettingDisplay,
  title: "User Settings/Switch Setting",
  tags: ["autodocs"],
  args: {
    setting: ExampleUserSettings["SwitchSetting"],
  },
  decorators: [
    (Story: any) => {
      return <Story />;
    },
  ],
};

export const Default = {
  args: {
    setting: ExampleUserSettings["SwitchSetting"],
  },
};
