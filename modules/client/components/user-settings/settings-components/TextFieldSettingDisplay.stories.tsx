import * as React from "react";
import { ExampleUserSettings } from "../UserSettingsDefinitions";
import { TextFieldSettingDisplay } from "./TextFieldSettingDisplay";

export default {
  component: TextFieldSettingDisplay,
  title: "User Settings/TextField Setting",
  tags: ["autodocs"],
  args: {
    setting: ExampleUserSettings["TextFieldSetting"],
  },
  decorators: [
    (Story: any) => {
      return <Story />;
    },
  ],
};

export const Default = {
  args: {
    setting: ExampleUserSettings["TextFieldSetting"],
  },
};
