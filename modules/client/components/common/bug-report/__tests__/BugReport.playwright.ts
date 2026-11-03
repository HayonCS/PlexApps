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

async function openBugReport(page: Page) {
  await page.getByRole("button", { name: "Report a Problem" }).click();
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

test.describe("BugReport", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("shows empty form state", async ({ page }) => {
    await openBugReport(page);

    await expect(page.getByTestId("bugReportSummaryInput")).toHaveValue("");
    await expect(page.getByTestId("bugReportDetailsInput")).toHaveValue("");
    await expect(page.getByTestId("bugReportCancel")).toBeVisible();
    await expect(page.getByTestId("bugReportSubmit")).toBeVisible();
  });

  test("shows required errors when submitting empty form", async ({ page }) => {
    await openBugReport(page);

    const summaryInput = page.getByTestId("bugReportSummaryInput");
    const detailsInput = page.getByTestId("bugReportDetailsInput");

    await page.getByTestId("bugReportSubmit").click();

    await expect(summaryInput).toHaveAttribute("aria-invalid", "true");
    await expect(detailsInput).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("* Required")).toHaveCount(2);
  });

  test("accepts custom form input", async ({ page }) => {
    await openBugReport(page);

    const summary = "The summary of the problem.";
    const details = "These are the descriptive details of the problem that is being reported.";

    await page.getByTestId("bugReportSummaryInput").fill(summary);
    await page.getByTestId("bugReportDetailsInput").fill(details);

    await expect(page.getByTestId("bugReportSummaryInput")).toHaveValue(summary);
    await expect(page.getByTestId("bugReportDetailsInput")).toHaveValue(details);
  });

  test("submits form and shows success notification", async ({ page }) => {
    await mockBugReportGraphql(page);
    await openBugReport(page);

    await page.getByTestId("bugReportSummaryInput").fill("Operations Manager Problem");
    await page
      .getByTestId("bugReportDetailsInput")
      .fill("I am experiencing an issue with the Operations Manager web app.");

    await page.getByTestId("bugReportSubmit").click();

    await expect(page.getByText("Ticket successfully submitted!")).toBeVisible();
  });

  test("shows submission error notification when request creation fails", async ({ page }) => {
    await mockBugReportGraphql(page, { createRequestShouldFail: true });
    await openBugReport(page);

    await page.getByTestId("bugReportSummaryInput").fill("Test Problem");
    await page.getByTestId("bugReportDetailsInput").fill("Test Description");

    await page.getByTestId("bugReportSubmit").click();

    await expect(page.getByText("Freshservice did not return the created service request.")).toBeVisible();
  });

  test("disables submit when catalog id is unavailable", async ({ page }) => {
    await mockBugReportGraphql(page, { catalogId: null });
    await openBugReport(page);

    await expect(page.getByTestId("bugReportSubmit")).toBeDisabled();
  });
});
