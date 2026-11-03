import { expect, Page } from "playwright/test";

export const BASE_URL = "http://localhost:3000";

export const defaultSettingsFixture = {
  DarkMode: {
    settingType: "SwitchType",
    label: "Dark Mode",
    description: "Enables the Dark Mode app theme.",
    tooltip: "Enable Dark Mode.",
    value: true,
    iconName: "dark_mode",
  },
  DefaultDisplayFormat: {
    settingType: "SelectType",
    label: "Default Format",
    description: "The default display format of the memory map grid.",
    tooltip: "Default Display Format.",
    iconName: "text_format",
    placeholder: "Format",
    selections: ["HEXADECIMAL", "BINARY", "ASCII", "DECIMAL"],
    value: "DECIMAL",
  },
};

export async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

export async function mockUserSettingsGraphql(page: Page, settings: Record<string, unknown>) {
  await page.route("**/graphql", async (route) => {
    let operationName: string | undefined;
    let queryText: string | undefined;

    const request = route.request();

    try {
      if (request.method() === "POST") {
        const postData = request.postDataJSON() as { operationName?: string; query?: string };
        operationName = postData?.operationName;
        queryText = postData?.query;
      }
    } catch {
      // Some requests can have non-JSON bodies.
    }

    if (!operationName || !queryText) {
      const parsedUrl = new URL(request.url());
      operationName = operationName ?? parsedUrl.searchParams.get("operationName") ?? undefined;
      queryText = queryText ?? parsedUrl.searchParams.get("query") ?? undefined;
    }

    const isGetUserSettings = operationName === "GetUserSettings" || queryText?.includes("getUserSettings") === true;
    const isSaveUserSettings = operationName === "SaveUserSettings" || queryText?.includes("saveUserSettings") === true;

    if (isGetUserSettings) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getUserSettings: settings,
          },
        }),
      });
      return;
    }

    if (isSaveUserSettings) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            saveUserSettings: true,
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

export async function openSettingsModal(page: Page) {
  // Settings controls can re-mount while the app shell is initializing.
  for (let attempt = 0; attempt < 5; attempt++) {
    const settingsButton = page.getByRole("button", { name: "Settings" }).first();
    try {
      await expect(settingsButton).toBeVisible({ timeout: 5000 });
      await settingsButton.click({ timeout: 5000 });
      break;
    } catch (error) {
      if (attempt === 4) {
        throw error;
      }
    }
  }

  await expect(page.getByTestId("user-settings-page")).toBeVisible();
  await expect(page.getByTestId("user-settings-list")).toBeVisible();
}
