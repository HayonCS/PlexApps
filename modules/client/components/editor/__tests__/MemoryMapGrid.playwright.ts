import { expect, test } from "playwright/test";
import { loginAs, mockEditorGraphql, openEditorRoute } from "./editor.playwright.helpers";

test.describe("MemoryMapGrid", () => {
  test.beforeEach(async ({ page }) => {
    await mockEditorGraphql(page);
    await loginAs(page);
    await openEditorRoute(page);
  });

  test("shows up on the screen and is visible", async ({ page }) => {
    await expect(page.getByTestId("memorymap-grid")).toBeVisible();
  });

  test("shows core headers", async ({ page }) => {
    await expect(page.getByText("COMMAND", { exact: true })).toBeVisible();
    await expect(page.getByText("PARAMETER", { exact: true })).toBeVisible();
    await expect(page.getByText("LOW LIMIT", { exact: true })).toBeVisible();
    await expect(page.getByText("VALUE", { exact: true })).toBeVisible();
    await expect(page.getByText("HIGH LIMIT", { exact: true })).toBeVisible();
  });

  test("displays expected AssemblyPartNumber row values", async ({ page }) => {
    const row = page.locator('[data-id="index0_AssemblyPartNumber"]');
    await expect(row).toBeVisible();
    await expect(row.locator('[data-field="command"]')).toContainText("AssemblyPartNumber");
    await expect(row.locator('[data-field="parameter"]')).toContainText("partNumber");
    await expect(row.locator('[data-field="lowLimit"]')).toContainText("0");
    await expect(row.locator('[data-field="value"]')).toContainText("0");
    await expect(row.locator('[data-field="highLimit"]')).toContainText("65535");
  });

  test("displays part number override columns", async ({ page }) => {
    const row = page.locator('[data-id="index0_AgcOverrideSetting"]');
    await expect(row).toBeVisible();
    await expect(row.locator('[data-field="605-1346-000"]')).toContainText("236");
    await expect(row.locator('[data-field="705-1364-000"]')).toContainText("222");
  });
});
