import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function mockSelectorGraphql(page: Page) {
  await page.route("**/graphql", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    let postData: { operationName?: string } | undefined;
    try {
      postData = route.request().postDataJSON() as { operationName?: string };
    } catch {
      await route.continue();
      return;
    }

    if (postData?.operationName === "GetMemoryMap") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getMemoryMap: {
              name: "305-0195-000",
              bomRevision: "BBB",
              version: 4,
              isWorkingCopy: true,
              commandset: null,
              commands: {
                TestCommand: {
                  parameters: {
                    testParameter: {
                      direction: "MEMORY",
                      lowLimit: "0",
                      value: "1",
                      highLimit: "255",
                    },
                  },
                },
              },
              testers: {
                Helm: {
                  Helm: {
                    TestCommand: "OP_NOT_SET",
                  },
                },
              },
              partNumbers: {},
            },
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

async function openEditorWithSelector(page: Page) {
  await page.goto(`${BASE_URL}/305-0195-000/BBB/4`);
  await expect(page.getByTestId("memorymap-grid")).toBeVisible();

  const selector = page.getByTestId("selector").first();
  await expect(selector).toBeVisible();
  return selector;
}

test.describe("Selector", () => {
  test.beforeEach(async ({ page }) => {
    await mockSelectorGraphql(page);
    await loginAs(page, "john.smith");
  });

  test("shows up on the screen and is visible", async ({ page }) => {
    const selector = await openEditorWithSelector(page);
    await expect(selector).toBeVisible();
  });

  test("has the correct selected option displayed", async ({ page }) => {
    const selector = await openEditorWithSelector(page);
    const selectedOption = selector.getByTestId("selected-option");

    await expect(selectedOption).toBeVisible();
    await expect(selectedOption).toContainText("NOT SET");
    await expect(selectedOption.getByTestId("not-set-adornment")).toBeVisible();
  });

  test("shows selector menu and all options when activated", async ({ page }) => {
    const selector = await openEditorWithSelector(page);

    // Double-click to enter DataGrid edit mode; OperationSelector auto-opens the menu when editable.
    await selector.dblclick();

    const selectorMenu = page.getByTestId("selector-menu");
    await expect(selectorMenu).toBeVisible();

    await expect(selectorMenu.getByTestId("op_not_set-option")).toBeVisible();
    await expect(selectorMenu.getByTestId("op_write-option")).toBeVisible();
    await expect(selectorMenu.getByTestId("op_verify-option")).toBeVisible();
    await expect(selectorMenu.getByTestId("op_calibrate-option")).toBeVisible();
    await expect(selectorMenu.getByTestId("op_limit-option")).toBeVisible();
    await expect(selectorMenu.getByTestId("op_def_chk-option")).toBeVisible();

    await expect(selectorMenu.getByTestId("not-set-adornment")).toBeVisible();
    await expect(selectorMenu.getByTestId("write-adornment")).toBeVisible();
    await expect(selectorMenu.getByTestId("verify-adornment")).toBeVisible();
    await expect(selectorMenu.getByTestId("calibrate-adornment")).toBeVisible();
    await expect(selectorMenu.getByTestId("limit-adornment")).toBeVisible();
    await expect(selectorMenu.getByTestId("default-check-adornment")).toBeVisible();
  });

  test("selects another option when clicked", async ({ page }) => {
    const selector = await openEditorWithSelector(page);
    const selectedOption = selector.getByTestId("selected-option");

    await expect(selectedOption).toContainText("NOT SET");

    await selector.dblclick();

    const selectorMenu = page.getByTestId("selector-menu");
    await expect(selectorMenu).toBeVisible();

    await selectorMenu.getByTestId("op_def_chk-option").click();

    await expect(selectorMenu).toHaveCount(0);
    await expect(selector.getByTestId("selected-option")).toContainText("DEF CHK");
  });
});
