import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function getCurrentUserDisplay(page: Page) {
  return page.getByTestId("app-bar").getByTestId("current-user-display");
}

test.describe("CurrentUserDisplay", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("shows up on screen and is visible", async ({ page }) => {
    const currentUserDisplay = await getCurrentUserDisplay(page);
    await expect(currentUserDisplay).toBeVisible();
  });

  test("has the correct user name displayed and formatted", async ({ page }) => {
    const currentUserDisplay = await getCurrentUserDisplay(page);
    const nameText = currentUserDisplay.getByTestId("name-text");

    await expect(nameText).toBeVisible();
    await expect(nameText).toHaveText("BILL BRASKY");
  });

  test("has an avatar displayed", async ({ page }) => {
    const currentUserDisplay = await getCurrentUserDisplay(page);
    await expect(currentUserDisplay.getByTestId("user-avatar")).toBeVisible();
  });

  test("shows the popper when hovered", async ({ page }) => {
    const currentUserDisplay = await getCurrentUserDisplay(page);
    const userAvatar = currentUserDisplay.getByTestId("user-avatar");

    await userAvatar.hover();
    await expect(page.getByTestId("current-user-display-popper-bill.brasky")).toBeVisible();
  });
});
