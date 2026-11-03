import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

type BugReportMockOptions = {
  catalogId?: number | null;
  createRequestShouldFail?: boolean;
};

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function openBugReportDialog(page: Page) {
  await page.getByRole("button", { name: "Report a Problem" }).click();
  await expect(page.getByTestId("BugReportDialog")).toBeVisible();
  await expect(page.getByTestId("bugReportRoot")).toBeVisible();
}

async function mockBugReportGraphql(page: Page, options: BugReportMockOptions = {}) {
  const { catalogId = 12345, createRequestShouldFail = false } = options;

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

    const operationName = postData?.operationName;

    if (operationName === "GetFreshserviceGTMCatalogId") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getFreshserviceGTMCatalogId: catalogId,
          },
        }),
      });
      return;
    }

    if (operationName === "CreateFreshserviceServiceRequest") {
      if (createRequestShouldFail) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              createFreshserviceServiceRequest: null,
            },
          }),
        });
        return;
      }

      const fields = postData?.variables?.fields as { summary?: string; details?: string } | undefined;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            createFreshserviceServiceRequest: {
              id: 999999,
              subject: fields?.summary ?? "Playwright Summary",
              description: fields?.details ?? "Playwright Details",
            },
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("BugReportDialog", () => {
  test("is closed by default after login", async ({ page }) => {
    await loginAs(page);

    await expect(page.getByTestId("BugReportDialog")).toBeHidden();
    await expect(page.getByTestId("bugReportRoot")).toBeHidden();
  });

  test("opens and shows the submission form", async ({ page }) => {
    await loginAs(page);
    await openBugReportDialog(page);

    await expect(page.getByTestId("bugReportHeader")).toBeVisible();
    await expect(page.getByTestId("bugReportBody")).toBeVisible();
    await expect(page.getByTestId("bugReportFooter")).toBeVisible();
    await expect(page.getByTestId("bugReportSummaryInput")).toBeVisible();
    await expect(page.getByTestId("bugReportDetailsInput")).toBeVisible();
    await expect(page.getByTestId("bugReportSubmit")).toBeVisible();
    await expect(page.getByTestId("bugReportCancel")).toBeVisible();
  });

  test("does not allow submit with insufficient information", async ({ page }) => {
    await loginAs(page);
    await openBugReportDialog(page);

    const summaryInput = page.getByTestId("bugReportSummaryInput");
    const detailsInput = page.getByTestId("bugReportDetailsInput");

    await expect(summaryInput).toHaveValue("");
    await expect(detailsInput).toHaveValue("");

    await page.getByTestId("bugReportSubmit").click();

    await expect(summaryInput).toHaveAttribute("aria-invalid", "true");
    await expect(detailsInput).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("* Required")).toHaveCount(2);
  });

  test("submits a bug report and shows success notification", async ({ page }) => {
    await mockBugReportGraphql(page);
    await loginAs(page);
    await openBugReportDialog(page);

    await page.getByTestId("bugReportSummaryInput").fill("Operations Manager Problem");
    await page
      .getByTestId("bugReportDetailsInput")
      .fill("I am experiencing an issue with the Operations Manager web app.");

    await page.getByTestId("bugReportSubmit").click();

    await expect(page.getByText("Ticket successfully submitted!")).toBeVisible();
    await expect(page.getByTestId("BugReportDialog")).toBeHidden();
  });

  test("shows error notification when submission fails", async ({ page }) => {
    await mockBugReportGraphql(page, { createRequestShouldFail: true });
    await loginAs(page);
    await openBugReportDialog(page);

    await page.getByTestId("bugReportSummaryInput").fill("Test Problem");
    await page.getByTestId("bugReportDetailsInput").fill("Test Description");

    await page.getByTestId("bugReportSubmit").click();

    await expect(page.getByText("Freshservice did not return the created service request.")).toBeVisible();
    await expect(page.getByTestId("BugReportDialog")).toBeVisible();
  });

  test("allows canceling the bug report dialog", async ({ page }) => {
    await loginAs(page);
    await openBugReportDialog(page);

    await page.getByTestId("bugReportCancel").click();

    await expect(page.getByTestId("BugReportDialog")).toBeHidden();
    await expect(page.getByTestId("bugReportRoot")).toBeHidden();
  });
});
