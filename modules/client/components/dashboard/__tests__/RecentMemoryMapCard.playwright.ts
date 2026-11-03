import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function mockRecentCardGraphql(page: Page) {
  await page.route("**/graphql", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    let postData: { operationName?: string; variables?: Record<string, unknown> } | undefined;
    try {
      postData = route.request().postDataJSON() as { operationName?: string; variables?: Record<string, unknown> };
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
              recentMemoryMaps: [
                {
                  memoryMapName: "305-0195-000",
                  bomRevision: "BBB",
                  version: 4,
                  lastAccessed: "2025-14-11T12:00:00Z",
                },
                {
                  memoryMapName: "305-1234-000",
                  bomRevision: "AAA",
                  version: 1,
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
      const mapName = postData?.variables?.memoryMapName;
      const bomRevision = postData?.variables?.bomRevision;
      const version = postData?.variables?.version;

      const isWorkingCopy = mapName === "305-0195-000" && bomRevision === "BBB" && version === 4;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { isWorkingCopyMemoryMap: isWorkingCopy } }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("RecentMemoryMapCard", () => {
  test.beforeEach(async ({ page }) => {
    await mockRecentCardGraphql(page);
    await loginAs(page);
  });

  test("shows card info and changelog button", async ({ page }) => {
    const card = page.getByTestId("recent-memorymap-card-305-0195-000-BBB-4");
    await expect(card).toBeVisible();

    await expect(card.getByTestId("memorymap-name")).toHaveText("305-0195-000");
    await expect(card.getByTestId("memorymap-bom-revision")).toHaveText("BBB");
    await expect(card.getByTestId("memorymap-version")).toContainText("v4");
    await expect(card.getByTestId("last-editor-label")).toContainText("Last Edited By");
    await expect(card.getByTestId("changelog-button")).toBeVisible();
  });

  test("shows working copy and production release symbols where expected", async ({ page }) => {
    const workingCopyCard = page.getByTestId("recent-memorymap-card-305-0195-000-BBB-4");
    await expect(workingCopyCard).toBeVisible();
    await expect(workingCopyCard.getByTestId("working-copy-icon")).toBeVisible();

    const productionReleaseCard = page.getByTestId("recent-memorymap-card-305-1234-000-AAA-1");
    await expect(productionReleaseCard).toBeVisible();
    await expect(productionReleaseCard.getByTestId("prod-release-icon")).toBeVisible();
  });
});
