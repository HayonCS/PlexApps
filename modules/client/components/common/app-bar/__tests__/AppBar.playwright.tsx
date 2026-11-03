import { test, expect } from "playwright/test";

test.describe("App Bar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.getByRole("textbox", { name: "Username" }).fill("bill.brasky");
    await page.getByRole("button", { name: "Log In" }).click();
    await page.waitForURL("**/dashboard");
  });

  test("shows up on the screen and is visible", async ({ page }) => {
    await expect(page.getByTestId("app-bar")).toBeVisible();
  });

  test("has a gentex logo", async ({ page }) => {
    await expect(page.getByTestId("app-bar").getByTestId("gentex-logo")).toBeVisible();
  });

  test("has a chevron separator", async ({ page }) => {
    await expect(page.getByTestId("app-bar").getByTestId("chevron")).toBeVisible();
  });

  test("has a current user display", async ({ page }) => {
    await expect(page.getByTestId("app-bar").getByTestId("current-user-display")).toBeVisible();
  });

  test("app bar title is clickable and styled as pointer", async ({ page }) => {
    const title = page.getByTestId("appbar-title");

    await expect(title).toBeVisible();
    await expect(title).toHaveCSS("cursor", "pointer");

    await title.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
