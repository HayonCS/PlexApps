import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { CheckboxSettingDisplay } from "../settings-components/CheckboxSettingDisplay";
import { CheckboxSetting } from "modules/core/schemas/user-settings.gen";

describe("Checkbox Setting Display", () => {
  const user = userEvent.setup();

  const setting: CheckboxSetting = {
    label: "Test Setting",
    settingType: "CheckboxType",
    value: false,
    tooltip: "Here is a tooltip for the test setting.",
    iconName: "settings",
    description: "A Checkbox Setting",
  };

  beforeEach(() => {
    render(<CheckboxSettingDisplay settingKey={"setting"} setting={setting} />);
  });

  it("should render the setting correctly.", () => {
    const checkboxSetting = screen.getByTestId("checkbox-setting");
    expect(checkboxSetting).toBeInTheDocument();
    expect(checkboxSetting).toBeVisible();

    const settingIcon = within(checkboxSetting).getByTestId("setting-icon");
    expect(settingIcon).toHaveTextContent("settings");

    const settingName = within(checkboxSetting).getByTestId("setting-name");
    expect(settingName).toHaveTextContent("Test Setting");

    const settingValue = within(checkboxSetting).getByTestId("setting-value");
    const checkbox = within(settingValue).getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should display the correct tooltip when hovered.", async () => {
    const checkboxSetting = screen.getByTestId("checkbox-setting");
    expect(checkboxSetting).toBeInTheDocument();
    expect(checkboxSetting).toBeVisible();

    await act(async () => {
      await user.hover(checkboxSetting);
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

  it("allows the user to change the check state.", async () => {
    const setting = screen.getByTestId("checkbox-setting");
    expect(setting).toBeInTheDocument();
    expect(setting).toBeVisible();

    const checkbox = within(setting).getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await act(async () => {
      await user.click(checkbox);
    });

    expect(checkbox).toBeChecked();
  });
});
