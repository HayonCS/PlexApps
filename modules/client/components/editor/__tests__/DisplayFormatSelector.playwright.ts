import { expect, test } from "playwright/test";
import { loginAs, mockEditorGraphql, openEditorRoute } from "./editor.playwright.helpers";

test.describe("DisplayFormatSelector", () => {
  test.beforeEach(async ({ page }) => {
    await mockEditorGraphql(page);
    await loginAs(page);
    await openEditorRoute(page);
  });

  test("shows up on the screen and is visible", async ({ page }) => {
    await expect(page.getByTestId("display-format-selector")).toBeVisible();
  });

  test("shows all selectable formats", async ({ page }) => {
    await expect(page.getByTestId("decimal-format-selector")).toBeVisible();
    await expect(page.getByTestId("binary-format-selector")).toBeVisible();
    await expect(page.getByTestId("hexadecimal-format-selector")).toBeVisible();
    await expect(page.getByTestId("ascii-format-selector")).toBeVisible();
  });

  test("allows selecting different formats", async ({ page }) => {
    await page.getByTestId("binary-format-radio").click();
    await expect(page.getByTestId("binary-format-radio")).toBeChecked();

    await page.getByTestId("hexadecimal-format-radio").click();
    await expect(page.getByTestId("hexadecimal-format-radio")).toBeChecked();

    await page.getByTestId("ascii-format-radio").click();
    await expect(page.getByTestId("ascii-format-radio")).toBeChecked();

    await page.getByTestId("decimal-format-radio").click();
    await expect(page.getByTestId("decimal-format-radio")).toBeChecked();
  });
});
