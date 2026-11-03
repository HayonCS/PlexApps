import { expect, test } from "playwright/test";
import { loginAs, mockEditorGraphql, openEditorRoute } from "./editor.playwright.helpers";

test.describe("OperationSelector", () => {
  test.beforeEach(async ({ page }) => {
    await mockEditorGraphql(page);
    await loginAs(page, "john.smith");
    await openEditorRoute(page);
  });

  test("shows selector with selected option", async ({ page }) => {
    const selector = page.getByTestId("selector").first();
    await expect(selector).toBeVisible();
    await expect(selector.getByTestId("selected-option")).toContainText(/VERIFY|WRITE|NOT SET|LIMIT|DEF CHK/);
  });

  test("opens selector menu and shows operation options", async ({ page }) => {
    const selector = page.getByTestId("selector").first();
    await selector.dblclick();

    const menu = page.getByTestId("selector-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByTestId("op_not_set-option")).toBeVisible();
    await expect(menu.getByTestId("op_write-option")).toBeVisible();
    await expect(menu.getByTestId("op_verify-option")).toBeVisible();
    await expect(menu.getByTestId("op_calibrate-option")).toBeVisible();
    await expect(menu.getByTestId("op_limit-option")).toBeVisible();
    await expect(menu.getByTestId("op_def_chk-option")).toBeVisible();
  });

  test("selects a different option", async ({ page }) => {
    const selector = page.getByTestId("selector").first();
    await selector.dblclick();

    const menu = page.getByTestId("selector-menu");
    await expect(menu).toBeVisible();
    await menu.getByTestId("op_def_chk-option").click();

    await expect(menu).toHaveCount(0);
    await expect(selector.getByTestId("selected-option")).toContainText("DEF CHK");
  });
});
