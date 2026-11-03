import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function openHealthPage(page: Page) {
  await page.goto(`${BASE_URL}/health`);
  await expect(page.getByRole("heading", { name: "Connection Status" })).toBeVisible();
}

async function mockHealthFetch(page: Page, status: number, delayMs = 0) {
  await page.route("**/health", async (route) => {
    const request = route.request();

    // Let document/script/style requests continue; only mock the hook's fetch("/health").
    if (request.resourceType() !== "fetch") {
      await route.continue();
      return;
    }

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ ok: status >= 200 && status < 300 }),
    });
  });
}

test.describe("ConnectionChecker", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("shows on screen and displays connected network/server status with timestamp", async ({ page }) => {
    await mockHealthFetch(page, 200);
    await openHealthPage(page);

    await expect(page.getByText("Network: Connected", { exact: true })).toBeVisible();
    await expect(page.getByText(/^Server: Connected \(\d+ms\)$/)).toBeVisible();
    await expect(page.getByText(/^WebSocket:/)).toBeVisible();
    await expect(page.getByText(/^Last checked:/)).toBeVisible();
  });

  test("displays disconnected server status without ping time when health check fails", async ({ page }) => {
    await mockHealthFetch(page, 503);
    await openHealthPage(page);

    const serverChip = page.getByText("Server: Disconnected", { exact: true });
    await expect(serverChip).toBeVisible();
    await expect(page.getByText(/Server: Disconnected \(\d+ms\)/)).toHaveCount(0);
  });

  test("displays disconnected network/server/websocket when browser is offline", async ({ page }) => {
    await openHealthPage(page);

    await page.context().setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    await expect(page.getByText("Network: Disconnected", { exact: true })).toBeVisible();
    await expect(page.getByText("Server: Disconnected", { exact: true })).toBeVisible();
    await expect(page.getByText("WebSocket: Disconnected", { exact: true })).toBeVisible();

    await page.context().setOffline(false);
  });

  test("shows loading server status and no last checked while health request is pending", async ({ page }) => {
    await mockHealthFetch(page, 200, 15000);
    await openHealthPage(page);

    await expect(page.getByText("Server: Loading ...", { exact: true })).toBeVisible();
    await expect(page.getByText(/^Last checked:/)).toHaveCount(0);
  });
});
