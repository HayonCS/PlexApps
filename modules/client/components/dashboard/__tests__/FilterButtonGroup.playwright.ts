import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function mockLibraryGraphql(page: Page) {
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
                Description: "Working Copy Map",
                BOMRevision: "BBB",
                InternalRevision: 4,
                IsWorkingCopy: true,
              },
              {
                PartNumber: "305-0191-002",
                Description: "Production Release Map",
                BOMRevision: "A  ",
                InternalRevision: 1,
                IsWorkingCopy: false,
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

test.describe("FilterButtonGroup", () => {
  test.beforeEach(async ({ page }) => {
    await mockLibraryGraphql(page);
    await loginAs(page);
  });

  test("shows up on the screen and is visible", async ({ page }) => {
    await expect(page.getByTestId("filter-button-group")).toBeVisible();
  });

  test("applies and clears working copy filter toggle", async ({ page }) => {
    const workingCopyButton = page.getByTestId("working-copy-filter-button");
    await expect(workingCopyButton).toBeVisible();

    await expect(workingCopyButton).toHaveAttribute("aria-pressed", "false");
    await workingCopyButton.click();
    await expect(workingCopyButton).toHaveAttribute("aria-pressed", "true");

    await workingCopyButton.click();
    await expect(workingCopyButton).toHaveAttribute("aria-pressed", "false");
  });

  test("applies and clears production release filter toggle", async ({ page }) => {
    const prodReleaseButton = page.getByTestId("prod-release-filter-button");
    await expect(prodReleaseButton).toBeVisible();

    await expect(prodReleaseButton).toHaveAttribute("aria-pressed", "false");
    await prodReleaseButton.click();
    await expect(prodReleaseButton).toHaveAttribute("aria-pressed", "true");

    await prodReleaseButton.click();
    await expect(prodReleaseButton).toHaveAttribute("aria-pressed", "false");
  });
});
