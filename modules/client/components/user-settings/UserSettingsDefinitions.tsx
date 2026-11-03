import { UserSettings } from "modules/core/schemas/user-settings.gen";

export const DefaultUserSettings: UserSettings = {
  DarkMode: {
    settingType: "SwitchType",
    label: "Dark Mode",
    description: "Enables the Dark Mode app theme.",
    tooltip: "Enable Dark Mode.",
    value: true,
    iconName: "dark_mode",
  },
  DefaultDisplayFormat: {
    settingType: "SelectType",
    label: "Default Format",
    description: "The default display format of the memory map grid.",
    tooltip: "Default Display Format.",
    iconName: "text_format",
    placeholder: "Format",
    selections: ["HEXADECIMAL", "BINARY", "ASCII", "DECIMAL"],
    value: "DECIMAL",
  },
};

/*
 * Here are examples of all user setting types.
 */

/*
 * !!!! ABOUT THE ICON NAME !!!!
 * Valid icon names are those from the following Google fonts location.
 * https://fonts.google.com/icons?icon.set=Material+Symbols
 */

export const ExampleUserSettings: UserSettings = {
  CheckboxSetting: {
    settingType: "CheckboxType",
    label: "Setting 1",
    description: "This is a checkbox setting. True or False",
    tooltip: "checkbox setting",
    value: true,
    iconName: "check_circle",
  },
  SwitchSetting: {
    settingType: "SwitchType",
    label: "Setting 2",
    description: "This is a switch setting. True or False",
    tooltip: "switch setting",
    value: true,
    iconName: "dark_mode",
  },
  SliderSetting: {
    settingType: "SliderType",
    label: "Setting 3",
    description: "This is a slider setting. Range 0 to 100",
    tooltip: "slider setting",
    value: 44,
    iconName: "linear_scale",
  },
  TextFieldSetting: {
    settingType: "TextFieldType",
    label: "Setting 4",
    description: "This is a text box setting. Input is a string",
    tooltip: "text field setting",
    value: "text field value",
    iconName: "text_fields",
  },
  SelectSetting: {
    settingType: "SelectType",
    label: "Setting 5",
    description: "This is a select setting. One option to be chose from a selection of items",
    tooltip: "select setting",
    value: "Option 2",
    selections: ["Option 1", "Option 2", "Option 3"],
    iconName: "list",
  },
  SelectSettingWithPlaceholder: {
    settingType: "SelectType",
    label: "Setting 6",
    description: "This is a select setting with a placeholder.",
    tooltip: "select setting w/ placeholder",
    value: "222",
    selections: [111, 222, 333, 444, 555],
    placeholder: "Placeholder",
    iconName: "list",
  },
};
