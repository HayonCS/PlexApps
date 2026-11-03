import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { TextFieldSetting } from "modules/core/schemas/user-settings.gen";
import { TextFieldSettingDisplay } from "../settings-components/TextFieldSettingDisplay";

describe("TextField Setting Display", () => {
  const user = userEvent.setup();

  const setting: TextFieldSetting = {
    label: "TextField Setting",
    tooltip: "Here is a tooltip for the test setting.",
    iconName: "settings",
    description: "A Text Field Setting",
    settingType: "TextFieldType",
    value: "Blah Blah Blah",
  };

  beforeEach(() => {
    render(<TextFieldSettingDisplay settingKey={"setting"} setting={setting} />);
  });

  it("should render the setting correctly.", () => {
    const textfieldSetting = screen.getByTestId("textfield-setting");
    expect(textfieldSetting).toBeInTheDocument();
    expect(textfieldSetting).toBeVisible();

    const settingIcon = within(textfieldSetting).getByTestId("setting-icon");
    expect(settingIcon).toHaveTextContent("settings");

    const settingName = within(textfieldSetting).getByTestId("setting-name");
    expect(settingName).toHaveTextContent("TextField Setting");

    const settingValue = within(textfieldSetting).getByRole("textbox");
    expect(settingValue).toHaveDisplayValue("Blah Blah Blah");
  });

  it("should display the correct tooltip when hovered.", async () => {
    const textfieldSetting = screen.getByTestId("textfield-setting");
    expect(textfieldSetting).toBeInTheDocument();
    expect(textfieldSetting).toBeVisible();

    await act(async () => {
      await user.hover(textfieldSetting);
    });

    await waitFor(
      async () => {
        const tooltip = await screen.findByRole("tooltip", {
          name: "Here is a tooltip for the test setting.",
        });

        expect(tooltip).toBeVisible();
      },
      { timeout: 3100 }
    );
  });

  it("allows the user to change the text.", async () => {
    const setting = screen.getByTestId("textfield-setting");
    const settingValue = within(setting).getByRole("textbox");

    expect(settingValue).toHaveDisplayValue("Blah Blah Blah");

    await act(async () => {
      await user.clear(settingValue);
      await user.type(settingValue, "New Blah Blah");
    });

    expect(settingValue).toHaveDisplayValue("New Blah Blah");
  });
});
