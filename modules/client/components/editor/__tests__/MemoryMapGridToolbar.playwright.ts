import { expect, test } from "playwright/test";
import { loginAs, mockEditorGraphql, openEditorRoute } from "./editor.playwright.helpers";

test.describe("MemoryMapGridToolbar", () => {
  test.beforeEach(async ({ page }) => {
    await mockEditorGraphql(page);
    await loginAs(page);
    await openEditorRoute(page);
  });

  test("shows up on the screen and is visible", async ({ page }) => {
    await expect(page.getByTestId("memorymap-grid-toolbar")).toBeVisible();
  });

  test("supports quick filter search and clear", async ({ page }) => {
    const toolbar = page.getByTestId("memorymap-grid-toolbar");
    const searchField = toolbar.getByPlaceholder("Search...");
    await expect(searchField).toBeVisible();

    await searchField.fill("test search");
    await expect(searchField).toHaveValue("test search");

    await toolbar.getByLabel("Clear search").click();
    await expect(searchField).toHaveValue("");
  });

  test("shows display format selector and allows changing format", async ({ page }) => {
    const selector = page.getByTestId("display-format-selector");
    await expect(selector).toBeVisible();

    await page.getByTestId("binary-format-radio").click();
    await expect(page.getByTestId("binary-format-radio")).toBeChecked();
  });

  test("shows export options", async ({ page }) => {
    const exportButton = page.getByTestId("export-speed-dial");
    await exportButton.click();

    await expect(page.getByLabel("Export As CSV")).toBeVisible();
    await expect(page.getByLabel("Export As Excel")).toBeVisible();
  });
});
