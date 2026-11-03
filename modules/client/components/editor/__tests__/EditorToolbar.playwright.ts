import { expect, test } from "playwright/test";
import { loginAs, mockEditorGraphql, openEditorRoute } from "./editor.playwright.helpers";

test.describe("EditorToolbar", () => {
  test.beforeEach(async ({ page }) => {
    await mockEditorGraphql(page);
    await loginAs(page, "john.smith");
  });

  test("shows toolbar with memory map label and editable icon", async ({ page }) => {
    await openEditorRoute(page, "/305-0195-000/BBB/4");
    const toolbar = page.getByTestId("editor-toolbar");

    await expect(toolbar).toBeVisible();
    await expect(toolbar).toContainText("305-0195-000 / BBB / 4");
    await expect(toolbar.getByTestId("EditIcon")).toBeVisible();
  });

  test("shows read-only icon for non-working-copy memory map", async ({ page }) => {
    await openEditorRoute(page, "/305-0195-000/BBB/1");
    const toolbar = page.getByTestId("editor-toolbar");

    await expect(toolbar).toBeVisible();
    await expect(toolbar).toContainText("305-0195-000 / BBB / 1^");
    await expect(toolbar.getByTestId("EditOffIcon")).toBeVisible();
  });
});
