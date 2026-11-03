import { expect, Page, test } from "playwright/test";
import {
  defaultSettingsFixture,
  loginAs,
  mockUserSettingsGraphql,
  openSettingsModal,
} from "./user-settings.playwright.helpers";

test.describe("SelectSettingDisplay", () => {
  test.beforeEach(async ({ page }) => {
    await mockUserSettingsGraphql(page, defaultSettingsFixture);
    await loginAs(page);
    await openSettingsModal(page);
  });

  const selectSettingLocator = (page: Page) =>
    page
      .getByTestId("select-setting")
      .filter({ has: page.getByTestId("setting-name").filter({ hasText: "Default Format" }) })
      .first();

  test("renders setting correctly", async ({ page }) => {
    const setting = selectSettingLocator(page);
    await expect(setting).toBeVisible();
    await expect(setting.getByTestId("setting-icon")).toContainText("text_format");
    await expect(setting.getByTestId("setting-name")).toContainText("Default Format");
    await expect(setting.getByRole("combobox")).toContainText("DECIMAL");
  });

  test("shows tooltip on hover", async ({ page }) => {
    const setting = selectSettingLocator(page);
    await setting.hover();
    await expect(page.getByRole("tooltip", { name: "Default Display Format." })).toBeVisible();
  });

  test("allows changing selected option", async ({ page }) => {
    const combobox = selectSettingLocator(page).getByRole("combobox");
    await combobox.click();
    await page.getByRole("option", { name: "BINARY", exact: true }).click();
    await expect(combobox).toContainText("BINARY");
    await expect(page.getByTestId("save-button")).toBeEnabled();
  });
});
