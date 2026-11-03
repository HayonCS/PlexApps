import { expect, Page, test } from "playwright/test";
import {
  defaultSettingsFixture,
  loginAs,
  mockUserSettingsGraphql,
  openSettingsModal,
} from "./user-settings.playwright.helpers";

test.describe("CheckboxSettingDisplay", () => {
  test.beforeEach(async ({ page }) => {
    await mockUserSettingsGraphql(page, defaultSettingsFixture);
    await loginAs(page);
    await openSettingsModal(page);
  });

  const darkModeSetting = (page: Page) =>
    page
      .getByTestId("switch-setting")
      .filter({ has: page.getByTestId("setting-name").filter({ hasText: "Dark Mode" }) })
      .first();

  test("renders setting correctly", async ({ page }) => {
    const setting = darkModeSetting(page);
    await expect(setting).toBeVisible();
    await expect(setting.getByTestId("setting-icon")).toContainText("dark_mode");
    await expect(setting.getByTestId("setting-name")).toContainText("Dark Mode");
    await expect(setting.getByRole("checkbox")).toBeChecked();
  });

  test("shows tooltip on hover", async ({ page }) => {
    const setting = darkModeSetting(page);
    await setting.hover();
    await expect(page.getByRole("tooltip", { name: "Enable Dark Mode." })).toBeVisible();
  });

  test("allows changing check state", async ({ page }) => {
    const checkbox = darkModeSetting(page).getByRole("checkbox");
    await expect(checkbox).toBeChecked();
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });
});
