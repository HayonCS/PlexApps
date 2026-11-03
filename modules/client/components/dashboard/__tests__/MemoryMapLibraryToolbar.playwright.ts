import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function mockToolbarGraphql(page: Page) {
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

    if (postData?.operationName === "GetAllMemoryMaps") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getAllMemoryMaps: [
              {
                PartNumber: "305-0195-000",
                Description: "test1234",
                BOMRevision: "BBB",
                InternalRevision: 4,
                IsWorkingCopy: true,
              },
            ],
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("MemoryMapLibraryToolbar", () => {
  test.beforeEach(async ({ page }) => {
    await mockToolbarGraphql(page);
    await loginAs(page);
  });

  test("renders and is visible", async ({ page }) => {
    await expect(page.getByTestId("memorymap-library-toolbar")).toBeVisible();
  });

  test("supports quick filter search and clear", async ({ page }) => {
    const toolbar = page.getByTestId("memorymap-library-toolbar");
    const searchField = toolbar.getByPlaceholder("Search...");
    await expect(searchField).toBeVisible();

    await searchField.fill("test search");
    await expect(searchField).toHaveValue("test search");

    await toolbar.getByLabel("Clear search").click();
    await expect(searchField).toHaveValue("");
  });

  test("shows and closes export options", async ({ page }) => {
    const toolbar = page.getByTestId("memorymap-library-toolbar");
    const exportButton = toolbar.getByTestId("export-speed-dial");
    await exportButton.click();

    await expect(page.getByLabel("Export As CSV")).toBeVisible();
    await expect(page.getByLabel("Export As Excel")).toBeVisible();

    await page.mouse.click(1, 1);
    await expect(page.getByLabel("Export As CSV")).toBeHidden();
  });
});
