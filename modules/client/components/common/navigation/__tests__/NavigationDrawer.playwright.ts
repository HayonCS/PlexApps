import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

test.describe("NavigationDrawer", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("shows up on the screen and is visible", async ({ page }) => {
    const drawer = page.getByTestId("navigation-drawer");
    await expect(drawer).toBeAttached();
    await expect(drawer.locator(".MuiDrawer-paper")).toBeVisible();
  });

  test("has a header", async ({ page }) => {
    await expect(page.getByTestId("navigation-drawer-header")).toBeVisible();
    await expect(page.getByText("NAVIGATION", { exact: true })).toBeVisible();
  });

  test("has all expected navigation items", async ({ page }) => {
    await expect(page.getByTestId("navigation-item-dashboard")).toBeVisible();
    await expect(page.getByTestId("navigation-item-editor")).toBeVisible();
    await expect(page.getByTestId("navigation-item-health")).toBeVisible();
    await expect(page.getByTestId("navigation-item-settings")).toBeVisible();
    await expect(page.getByTestId("navigation-item-report-a-problem")).toBeVisible();
  });
});
