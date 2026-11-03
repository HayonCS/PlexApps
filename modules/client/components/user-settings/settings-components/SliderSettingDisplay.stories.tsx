import * as React from "react";
import { ExampleUserSettings } from "../UserSettingsDefinitions";
import { SliderSettingDisplay } from "./SliderSettingDisplay";

export default {
  component: SliderSettingDisplay,
  title: "User Settings/Slider Setting",
  tags: ["autodocs"],
  args: {
    setting: ExampleUserSettings["SliderSetting"],
  },
  decorators: [
    (Story: any) => {
      return <Story />;
    },
  ],
};

export const Default = {
  args: {
    setting: ExampleUserSettings["SliderSetting"],
  },
};
