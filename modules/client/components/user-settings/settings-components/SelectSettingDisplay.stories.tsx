import * as React from "react";
import { ExampleUserSettings } from "../UserSettingsDefinitions";
import { SelectSettingDisplay } from "./SelectSettingDisplay";

export default {
  component: SelectSettingDisplay,
  title: "User Settings/Select Setting",
  tags: ["autodocs"],
  args: {
    setting: ExampleUserSettings["SelectSetting"],
  },
  decorators: [
    (Story: any) => {
      return <Story />;
    },
  ],
};

export const Default = {
  args: {
    setting: ExampleUserSettings["SelectSetting"],
  },
};

export const WithPlaceholder = {
  args: {
    setting: ExampleUserSettings["SelectSettingWithPlaceholder"],
  },
};
