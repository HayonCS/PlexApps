import { expect, test } from "playwright/test";
import { loginAs, mockEditorGraphql, openEditorRoute } from "./editor.playwright.helpers";

test.describe("UndoRedo", () => {
  test.beforeEach(async ({ page }) => {
    await mockEditorGraphql(page);
    await loginAs(page, "john.smith");
    await openEditorRoute(page, "/305-0195-000/BBB/4");
  });

  test("edits a value cell then undo/redo updates displayed value", async ({ page }) => {
    const valueCell = page.locator('[data-id="index0_MfgOpsManagerPartNumber"] [data-field="value"]');
    await expect(valueCell).toContainText("0");

    await valueCell.click();
    await valueCell.dblclick();

    const input = valueCell.getByRole("textbox");
    await expect(input).toBeVisible();
    await input.fill("123");
    await input.press("Enter");

    await expect(valueCell).toContainText("123");

    const undoButton = page.getByTestId("undoButton");
    await expect(undoButton).toBeEnabled();
    await undoButton.click();
    await expect(valueCell).toContainText("0");

    const redoButton = page.getByTestId("redoButton");
    await expect(redoButton).toBeEnabled();
    await redoButton.click();
    await expect(valueCell).toContainText("123");
  });
});
