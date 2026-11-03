import { expect, test } from "playwright/test";
import { loginAs, mockEditorGraphql, openEditorRoute } from "./editor.playwright.helpers";

test.describe("EditorRouting", () => {
  test.beforeEach(async ({ page }) => {
    await mockEditorGraphql(page);
    await loginAs(page);
  });

  test("loads memory map route with command and parameter and selects row", async ({ page }) => {
    await openEditorRoute(page, "/305-0195-000/BBB/4/AssemblyPartNumber/partNumber");

    const row = page.locator('[data-id="index0_AssemblyPartNumber"]');
    await expect(row).toBeVisible();
    await expect(row).toHaveAttribute("aria-selected", "true");
  });

  test("loads route with command only and selects first parameter row", async ({ page }) => {
    await openEditorRoute(page, "/305-0195-000/BBB/4/MfgOpsManagerPartNumber/");

    const firstParamRow = page.locator('[data-id="index0_MfgOpsManagerPartNumber"]');
    await expect(firstParamRow).toBeVisible();
    await expect(firstParamRow).toHaveAttribute("aria-selected", "true");
  });

  test("matches command and parameter case-insensitively", async ({ page }) => {
    await openEditorRoute(page, "/305-0195-000/BBB/4/assemblYPartNumber/PARTnumber");

    const row = page.locator('[data-id="index0_AssemblyPartNumber"]');
    await expect(row).toBeVisible();
    await expect(row).toHaveAttribute("aria-selected", "true");
  });
});
