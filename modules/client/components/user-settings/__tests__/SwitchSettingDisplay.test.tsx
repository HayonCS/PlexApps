import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { SwitchSetting } from "modules/core/schemas/user-settings.gen";
import { SwitchSettingDisplay } from "../settings-components/SwitchSettingDisplay";

describe("Switch Setting Display", () => {
  const user = userEvent.setup();

  const setting: SwitchSetting = {
    label: "Switch Setting",
    value: false,
    tooltip: "Here is a tooltip for the test setting.",
    iconName: "settings",
    description: "A Switch Setting",
    settingType: "SwitchType",
  };

  beforeEach(() => {
    render(<SwitchSettingDisplay settingKey={"setting"} setting={setting} />);
  });

  it("should render the setting correctly.", () => {
    const switchSetting = screen.getByTestId("switch-setting");
    expect(switchSetting).toBeInTheDocument();
    expect(switchSetting).toBeVisible();

    const settingIcon = within(switchSetting).getByTestId("setting-icon");
    expect(settingIcon).toHaveTextContent("settings");

    const settingName = within(switchSetting).getByTestId("setting-name");
    expect(settingName).toHaveTextContent("Switch Setting");

    const settingValue = within(switchSetting).getByTestId("setting-value");
    const checkbox = within(settingValue).getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should display the correct tooltip when hovered.", async () => {
    const switchSetting = screen.getByTestId("switch-setting");
    expect(switchSetting).toBeInTheDocument();
    expect(switchSetting).toBeVisible();

    await act(async () => {
      await user.hover(switchSetting);
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

  it("allows the user to change the switch state.", async () => {
    const setting = screen.getByTestId("switch-setting");
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
