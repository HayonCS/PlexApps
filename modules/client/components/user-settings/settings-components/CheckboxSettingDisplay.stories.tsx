import * as React from "react";
import { ExampleUserSettings } from "../UserSettingsDefinitions";
import { CheckboxSettingDisplay } from "./CheckboxSettingDisplay";

export default {
  component: CheckboxSettingDisplay,
  title: "User Settings/Checkbox Setting",
  tags: ["autodocs"],
  args: {
    setting: ExampleUserSettings["CheckboxSetting"],
  },
  decorators: [
    (Story: any) => {
      return <Story />;
    },
  ],
};

export const Default = {
  args: {
    setting: ExampleUserSettings["CheckboxSetting"],
  },
};
