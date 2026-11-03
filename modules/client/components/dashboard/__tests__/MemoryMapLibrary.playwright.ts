import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function mockMemoryMapLibraryGraphql(page: Page) {
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
                PartNumber: "305-0014-000",
                Description: "MEMORY MAP A",
                BOMRevision: "001",
                InternalRevision: 1,
                IsWorkingCopy: true,
              },
              {
                PartNumber: "305-0191-002",
                Description: "MEMORY MAP B",
                BOMRevision: "A  ",
                InternalRevision: 1,
                IsWorkingCopy: false,
              },
              {
                PartNumber: "305-0191-002",
                Description: "MEMORY MAP B WC",
                BOMRevision: "A  ",
                InternalRevision: 2,
                IsWorkingCopy: true,
              },
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

test.describe("MemoryMapLibrary", () => {
  test.beforeEach(async ({ page }) => {
    await mockMemoryMapLibraryGraphql(page);
    await loginAs(page);
  });

  test("shows up on the screen and is visible", async ({ page }) => {
    await expect(page.getByTestId("memory-map-library")).toBeVisible();
  });

  test("has export speed dial and search bar", async ({ page }) => {
    await expect(page.getByTestId("export-speed-dial")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
    await expect(page.getByRole("searchbox")).toBeVisible();
  });

  test("contains expected memory map groups", async ({ page }) => {
    await expect(page.getByTestId("auto-generated-row-PartNumber/305-0014-000")).toBeVisible();
    await expect(page.getByTestId("auto-generated-row-PartNumber/305-0191-002")).toBeVisible();
    await expect(page.getByTestId("auto-generated-row-PartNumber/305-0195-000")).toBeVisible();
  });

  test("allows searching for a memory map", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");
    await searchInput.fill("305-00");

    await expect(page.getByTestId("auto-generated-row-PartNumber/305-0014-000")).toBeVisible();
    await expect(page.getByTestId("auto-generated-row-PartNumber/305-0191-002")).toHaveCount(0);
  });

  test("navigates to selected memory map", async ({ page }) => {
    const groupRow = page.getByTestId("auto-generated-row-PartNumber/305-0195-000");
    await expect(groupRow).toBeVisible();
    await groupRow.getByRole("button").click();

    const bomRow = page.getByTestId("auto-generated-row-PartNumber/305-0195-000-BOMRevision/BBB");
    await expect(bomRow).toBeVisible();
    await bomRow.getByRole("button").click();

    const leafRow = page.getByTestId("305-0195-000,BBB,4");
    await expect(leafRow).toBeVisible();
    await leafRow.click();

    await expect(page).toHaveURL(/\/305-0195-000\/BBB\/4/);
  });
});
