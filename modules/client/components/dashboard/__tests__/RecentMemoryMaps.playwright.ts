import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function mockRecentMapsGraphql(page: Page, empty = false) {
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

    if (postData?.operationName === "GetRecentMemoryMaps") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getRecentMemoryMaps: {
              recentMemoryMaps: empty
                ? []
                : [
                    {
                      memoryMapName: "305-0195-000",
                      bomRevision: "BBB",
                      version: 4,
                      lastAccessed: "2025-14-11T12:00:00Z",
                    },
                    {
                      memoryMapName: "305-1111-000",
                      bomRevision: "AAA",
                      version: 2,
                      lastAccessed: "2025-14-11T03:00:00Z",
                    },
                    {
                      memoryMapName: "305-1234-000",
                      bomRevision: "CCC",
                      version: 3,
                      lastAccessed: "2025-14-11T06:00:00Z",
                    },
                  ],
            },
          },
        }),
      });
      return;
    }

    if (postData?.operationName === "IsWorkingCopyMemoryMap") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { isWorkingCopyMemoryMap: true } }),
      });
      return;
    }

    if (postData?.operationName === "ClearRecentMemoryMaps") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { clearRecentMemoryMaps: true } }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("RecentMemoryMaps", () => {
  test("shows recent maps section and cards", async ({ page }) => {
    await mockRecentMapsGraphql(page, false);
    await loginAs(page);

    const container = page.getByTestId("recent-memory-maps");
    await expect(container).toBeVisible();
    await expect(page.getByTestId("recent-memorymap-card-305-0195-000-BBB-4")).toBeVisible();
    await expect(page.getByTestId("recent-memorymap-card-305-1111-000-AAA-2")).toBeVisible();
    await expect(page.getByTestId("recent-memorymap-card-305-1234-000-CCC-3")).toBeVisible();
    await expect(page.getByTestId("clear-recent-maps-button")).toBeVisible();
  });

  test("shows placeholders and hides clear button when no recent maps", async ({ page }) => {
    await mockRecentMapsGraphql(page, true);
    await loginAs(page);

    const container = page.getByTestId("recent-memory-maps");
    await expect(container).toBeVisible();
    await expect(container.getByTestId("placeholder-card").first()).toBeVisible();
    await expect(page.getByTestId("clear-recent-maps-button")).toHaveCount(0);
  });
});
