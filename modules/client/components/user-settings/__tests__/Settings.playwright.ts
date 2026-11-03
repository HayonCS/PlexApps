import { expect, test } from "playwright/test";
import {
  defaultSettingsFixture,
  loginAs,
  mockUserSettingsGraphql,
  openSettingsModal,
} from "./user-settings.playwright.helpers";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await mockUserSettingsGraphql(page, defaultSettingsFixture);
    await loginAs(page);
    await openSettingsModal(page);
  });

  test("is visible with settings list and bottom buttons", async ({ page }) => {
    const settingsPage = page.getByTestId("user-settings-page");
    await expect(settingsPage).toBeVisible();
    await expect(page.getByTestId("user-settings-list")).toBeVisible();
    await expect(page.getByTestId("defaults-button")).toBeVisible();
    await expect(page.getByTestId("save-button")).toBeVisible();
  });

  test("contains settings from loaded configuration", async ({ page }) => {
    await expect(page.getByTestId("switch-setting")).toBeVisible();
    await expect(page.getByTestId("select-setting")).toBeVisible();
  });
});
