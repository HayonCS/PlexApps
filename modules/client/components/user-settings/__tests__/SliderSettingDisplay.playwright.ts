import { expect, Page, test } from "playwright/test";
import {
  defaultSettingsFixture,
  loginAs,
  mockUserSettingsGraphql,
  openSettingsModal,
} from "./user-settings.playwright.helpers";

test.describe("SliderSettingDisplay", () => {
  test.beforeEach(async ({ page }) => {
    await mockUserSettingsGraphql(page, defaultSettingsFixture);
    await loginAs(page);
    await openSettingsModal(page);
  });

  const defaultFormatCombobox = (page: Page) =>
    page
      .getByTestId("select-setting")
      .filter({ has: page.getByTestId("setting-name").filter({ hasText: "Default Format" }) })
      .first()
      .getByRole("combobox");

  test("defaults button starts disabled", async ({ page }) => {
    await expect(page.getByTestId("defaults-button")).toBeDisabled();
  });

  test("defaults button is enabled after a setting change", async ({ page }) => {
    const combobox = defaultFormatCombobox(page);
    await combobox.click();
    await page.getByRole("option", { name: "BINARY", exact: true }).click();

    await expect(combobox).toContainText("BINARY");
    await expect(page.getByTestId("defaults-button")).toBeEnabled();
    await expect(page.getByTestId("save-button")).toBeEnabled();
  });

  test("defaults button resets settings to baseline", async ({ page }) => {
    const combobox = defaultFormatCombobox(page);
    await combobox.click();
    await page.getByRole("option", { name: "BINARY", exact: true }).click();
    await expect(combobox).toContainText("BINARY");

    await page.getByTestId("defaults-button").click();
    await expect(combobox).toContainText("DECIMAL");
    await expect(page.getByTestId("defaults-button")).toBeDisabled();
  });
});
