import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function openChangelog(page: Page) {
  await page.getByRole("button", { name: "Changelog" }).click();
  await expect(page.getByText("Operations Manager", { exact: true })).toBeVisible();
}

test.describe("ChangeLogDialog", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("does not render when closed", async ({ page }) => {
    await expect(page.getByText("Operations Manager", { exact: true })).toHaveCount(0);
  });

  test("renders dialog when open", async ({ page }) => {
    await openChangelog(page);

    await expect(page.getByText(/Version\s+\d+\.\d+\.\d+/)).toBeVisible();
  });

  test("displays changelog content", async ({ page }) => {
    await openChangelog(page);

    await expect(page.getByText("Initial commit of the baseline template for new apps.").first()).toBeVisible();
    await expect(page.getByText("This will be the starting point for OpsManager.").first()).toBeVisible();
  });

  test("extracts and displays version number in title", async ({ page }) => {
    await openChangelog(page);

    await expect(page.getByText("Version 0.0.2")).toBeVisible();
  });

  test("closes when Close button is clicked", async ({ page }) => {
    await openChangelog(page);

    await page.getByRole("button", { name: "close" }).click();
    await expect(page.getByText("Operations Manager", { exact: true })).toHaveCount(0);
  });

  test("closes when clicking outside dialog", async ({ page }) => {
    await openChangelog(page);

    await page.mouse.click(5, 5);
    await expect(page.getByText("Operations Manager", { exact: true })).toHaveCount(0);
  });

  test("only shows changelog content after opening dialog", async ({ page }) => {
    const changelogEntry = page.getByText("Initial commit of the baseline template for new apps.");
    await expect(changelogEntry).toHaveCount(0);

    await openChangelog(page);
    await expect(changelogEntry.first()).toBeVisible();
  });
});
