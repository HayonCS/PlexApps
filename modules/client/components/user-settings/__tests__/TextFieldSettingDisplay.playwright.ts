import { expect, Page, test } from "playwright/test";
import {
  defaultSettingsFixture,
  loginAs,
  mockUserSettingsGraphql,
  openSettingsModal,
} from "./user-settings.playwright.helpers";

test.describe("TextFieldSettingDisplay", () => {
  test.beforeEach(async ({ page }) => {
    await mockUserSettingsGraphql(page, defaultSettingsFixture);
    await loginAs(page);
    await openSettingsModal(page);
  });

  const darkModeToggle = (page: Page) =>
    page
      .getByTestId("switch-setting")
      .filter({ has: page.getByTestId("setting-name").filter({ hasText: "Dark Mode" }) })
      .first()
      .getByRole("checkbox");

  test("save button starts disabled", async ({ page }) => {
    await expect(page.getByTestId("save-button")).toBeDisabled();
  });

  test("save button is enabled after settings changes", async ({ page }) => {
    const toggle = darkModeToggle(page);
    await toggle.click();

    await expect(toggle).not.toBeChecked();
    await expect(page.getByTestId("save-button")).toBeEnabled();
  });

  test("save closes the modal on success", async ({ page }) => {
    const toggle = darkModeToggle(page);
    await toggle.click();
    await expect(page.getByTestId("save-button")).toBeEnabled();

    await page.getByTestId("save-button").click();
    await expect(page.getByTestId("user-settings-page")).not.toBeVisible();
  });
});
