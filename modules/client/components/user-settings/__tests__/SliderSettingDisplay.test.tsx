import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { SliderSettingDisplay } from "../settings-components/SliderSettingDisplay";
import { SliderSetting } from "modules/core/schemas/user-settings.gen";

describe("Slider Setting Display", () => {
  const user = userEvent.setup();

  const setting: SliderSetting = {
    label: "Slider Setting",
    tooltip: "Here is a tooltip for the test setting.",
    iconName: "settings",
    description: "A Slider Setting",
    settingType: "SliderType",
    value: 10,
    max: 20,
    min: 0,
    step: 1,
  };

  beforeEach(() => {
    render(<SliderSettingDisplay settingKey={"setting"} setting={setting} />);
  });

  it("should render the setting correctly.", () => {
    const sliderSetting = screen.getByTestId("slider-setting");
    expect(sliderSetting).toBeInTheDocument();
    expect(sliderSetting).toBeVisible();

    const settingIcon = within(sliderSetting).getByTestId("setting-icon");
    expect(settingIcon).toHaveTextContent("settings");

    const settingName = within(sliderSetting).getByTestId("setting-name");
    expect(settingName).toHaveTextContent("Slider Setting");

    const settingValue = within(sliderSetting).getByTestId("setting-value");
    const slider = within(settingValue).getByRole("slider");
    expect(slider).toHaveValue("10");
  });

  it("should display the correct tooltip when hovered.", async () => {
    const sliderSetting = screen.getByTestId("slider-setting");
    expect(sliderSetting).toBeInTheDocument();
    expect(sliderSetting).toBeVisible();

    await act(async () => {
      await user.hover(sliderSetting);
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

  it("allows the user to change the slider.", async () => {
    const setting = screen.getByTestId("slider-setting");
    expect(setting).toBeInTheDocument();
    expect(setting).toBeVisible();

    const slider = within(setting).getByRole("slider");

    await act(async () => {
      await fireEvent.change(slider, { target: { value: 4 } });
    });

    expect(slider).toHaveValue("4");
  });
});
