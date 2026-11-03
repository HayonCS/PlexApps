import { expect, Page, test } from "playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: Page, username = "bill.brasky") {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/dashboard");
}

async function openCurrentUserPopper(page: Page) {
  const userAvatar = page.getByTestId("app-bar").getByTestId("current-user-display").getByTestId("user-avatar");
  await userAvatar.hover();

  const popper = page.getByTestId("current-user-display-popper-bill.brasky");
  await expect(popper).toBeVisible();
  return popper;
}

test.describe("CurrentUserDisplayPopper", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("shows up on screen and is visible", async ({ page }) => {
    await openCurrentUserPopper(page);
  });

  test("has a user profile picture", async ({ page }) => {
    const popper = await openCurrentUserPopper(page);
    await expect(popper.getByTestId("popper-user-avatar")).toBeVisible();
  });

  test("has social buttons", async ({ page }) => {
    const popper = await openCurrentUserPopper(page);
    await expect(popper.getByTestId("popper-social-buttons")).toBeVisible();
  });

  test("has user details visible", async ({ page }) => {
    const popper = await openCurrentUserPopper(page);

    await expect(popper.getByTestId("popper-fullname")).toContainText("Bill Brasky");
    await expect(popper.getByTestId("popper-fullname")).toContainText(/\(Author\)|\(User\)/);
    await expect(popper.getByTestId("popper-phone-number-formatted")).toBeVisible();
    await expect(popper.getByTestId("popper-location")).toBeVisible();
    await expect(popper.getByTestId("popper-email-address")).toBeVisible();
  });

  test("has settings and logout buttons", async ({ page }) => {
    const popper = await openCurrentUserPopper(page);

    await expect(popper.getByTestId("popper-button-settings")).toBeVisible();
    await expect(popper.getByTestId("popper-button-logout")).toBeVisible();
  });
});
