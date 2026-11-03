import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { DefaultUserSettings } from "../UserSettingsDefinitions";
import { Settings } from "../Settings";
import { configureStore } from "@reduxjs/toolkit";
import { createRootReducer } from "modules/client/redux/store";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import { MockedProvider } from "@apollo/client/testing";
import { ActiveDirectoryMocks } from "modules/client/test-helpers/mocks/active-directory-mocks";
import { EmployeePictureMocks } from "modules/client/test-helpers/mocks/employee-picture-mocks";

const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: {
    UserSettings: {
      settings: DefaultUserSettings,
      settingsBackup: DefaultUserSettings,
      userSettingsOpen: true,
    },
  },
});

const UserSettingsProvider = mockProvider({
  initialHistoryStack: "/dashboard",
  logMissingMocks: true,
  reduxStore: store,
});

describe("Settings Component", () => {
  beforeEach(() => {
    render(
      <MockedProvider mocks={[...ActiveDirectoryMocks, ...EmployeePictureMocks]}>
        <UserSettingsProvider>
          <Settings />
        </UserSettingsProvider>
      </MockedProvider>
    );
  });

  it("Should be visible and contain a settings list and the bottom buttons.", () => {
    const userSettingsPage = screen.getByTestId("user-settings-page");
    expect(userSettingsPage).toBeInTheDocument();
    expect(userSettingsPage).toBeVisible();

    const userSettingsList = within(userSettingsPage).getByTestId("user-settings-list");
    expect(userSettingsList).toBeInTheDocument();
    expect(userSettingsList).toBeVisible();

    const defaultsButton = within(userSettingsPage).getByTestId("defaults-button");
    expect(defaultsButton).toBeInTheDocument();
    expect(defaultsButton).toBeVisible();

    const saveButton = within(userSettingsPage).getByTestId("save-button");
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeVisible();
  });

  it("Should contain all of the settings.", () => {
    const switchSetting = screen.getByTestId("switch-setting");
    expect(switchSetting).toBeInTheDocument();
    expect(switchSetting).toBeVisible();
  });
});
