import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { SelectSetting } from "modules/core/schemas/user-settings.gen";
import { SelectSettingDisplay } from "../settings-components/SelectSettingDisplay";

describe("Select Setting Display", () => {
  const user = userEvent.setup();

  const setting: SelectSetting = {
    label: "Select Setting",
    settingType: "SelectType",
    value: "Option 1",
    tooltip: "Here is a tooltip for the test setting.",
    iconName: "settings",
    description: "A Select Setting",
    selections: ["Option 1", "Option 2"],
    placeholder: "Option 1",
  };

  beforeEach(() => {
    render(<SelectSettingDisplay settingKey={"setting"} setting={setting} />);
  });

  it("should render the setting correctly.", () => {
    const selectSetting = screen.getByTestId("select-setting");
    expect(selectSetting).toBeInTheDocument();
    expect(selectSetting).toBeVisible();

    const settingIcon = within(selectSetting).getByTestId("setting-icon");
    expect(settingIcon).toHaveTextContent("settings");

    const settingName = within(selectSetting).getByTestId("setting-name");
    expect(settingName).toHaveTextContent("Select Setting");

    const settingValue = within(selectSetting).getByTestId("setting-value");
    const combobox = within(settingValue).getByRole("combobox");
    expect(combobox).toHaveTextContent("Option 1");
  });

  it("should display the correct tooltip when hovered.", async () => {
    const selectSetting = screen.getByTestId("select-setting");
    expect(selectSetting).toBeInTheDocument();
    expect(selectSetting).toBeVisible();

    await act(async () => {
      await user.hover(selectSetting);
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

  it("allows the user to change the selected option.", async () => {
    const setting = screen.getByTestId("select-setting");
    expect(setting).toBeInTheDocument();
    expect(setting).toBeVisible();

    const combobox = within(setting).getByRole("combobox");
    expect(combobox).toHaveTextContent("Option 1");

    await act(async () => {
      await user.click(combobox);
    });

    const option2 = screen.getByText("Option 2");

    await act(async () => {
      await user.click(option2);
    });

    expect(combobox).toHaveTextContent("Option 2");
  });
});
