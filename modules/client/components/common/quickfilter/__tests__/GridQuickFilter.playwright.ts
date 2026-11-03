import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function mockQuickFilterGraphql(page: Page) {
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
                Description: "Test Memory Map",
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
              commands: {},
              testers: {},
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

test.describe("GridQuickFilter", () => {
  test.beforeEach(async ({ page }) => {
    await mockQuickFilterGraphql(page);
    await loginAs(page);
  });

  test("supports searching and clearing in memory map library toolbar", async ({ page }) => {
    const toolbar = page.getByTestId("memorymap-library-toolbar");
    await expect(toolbar).toBeVisible();

    const trigger = toolbar.getByTestId("grid-quick-filter-trigger");
    const searchField = toolbar.getByPlaceholder("Search...");
    await expect(trigger).toBeAttached();
    await expect(searchField).toBeVisible();

    await searchField.fill("test search");
    await expect(searchField).toHaveValue("test search");
    await expect(page).toHaveURL(/search=test\+search|search=test%20search/);

    await toolbar.getByLabel("Clear search").click();
    await expect(searchField).toHaveValue("");
    await expect(page).not.toHaveURL(/search=/);
  });

  test("supports searching and clearing in memory map grid toolbar", async ({ page }) => {
    await page.goto(`${BASE_URL}/305-0195-000/BBB/4`);
    await expect(page.getByTestId("memorymap-grid-toolbar")).toBeVisible();

    const toolbar = page.getByTestId("memorymap-grid-toolbar");
    const trigger = toolbar.getByTestId("grid-quick-filter-trigger");
    const searchField = toolbar.getByPlaceholder("Search...");
    await expect(trigger).toBeAttached();
    await expect(searchField).toBeVisible();

    await searchField.fill("test search");
    await expect(searchField).toHaveValue("test search");
    await expect(page).toHaveURL(/search=test\+search|search=test%20search/);

    await toolbar.getByLabel("Clear search").click();
    await expect(searchField).toHaveValue("");
    await expect(page).not.toHaveURL(/search=/);
  });
});
