import { expect, test } from "playwright/test";
import { loginAs, mockEditorGraphql, openEditorRoute } from "./editor.playwright.helpers";

test.describe("CommandSetManager", () => {
  test.beforeEach(async ({ page }) => {
    await mockEditorGraphql(page);
    await loginAs(page);
    await openEditorRoute(page, "/305-0195-000/BBB/4");
  });

  test("shows up and expands", async ({ page }) => {
    const manager = page.getByTestId("commandset-manager");
    await expect(manager).toBeVisible();

    const expandButton = page.getByTestId("expand-button");
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    await expect(page.getByTestId("header-text")).toBeVisible();
  });

  test("shows selector and commandset metadata", async ({ page }) => {
    await page.getByTestId("expand-button").click();

    await expect(page.getByTestId("commandset-selector")).toContainText("1845_BMW_Project_2021.cmdset");
    await expect(page.getByTestId("commandset-revision-header")).toContainText("Revision:");
    await expect(page.getByTestId("commandset-revision")).toContainText("52497");
    await expect(page.getByTestId("commandset-description-header")).toContainText("Description:");
    await expect(page.getByTestId("commandset-description")).toContainText("1845 BMW Project 2021");
  });

  test("shows command list and parameter list on command selection", async ({ page }) => {
    await page.getByTestId("expand-button").click();

    const commandList = page.getByTestId("command-list");
    await expect(commandList).toBeVisible();

    const commands = commandList.getByTestId("command-list-command");
    await expect(commands.first()).toBeVisible();
    await commands.first().click();

    const parameterList = page.getByTestId("parameter-list");
    await expect(parameterList).toBeVisible();
    await expect(parameterList.getByTestId("command-parameter").first()).toBeVisible();
  });
});
