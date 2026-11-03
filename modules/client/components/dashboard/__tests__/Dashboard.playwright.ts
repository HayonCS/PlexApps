import { test, expect } from "playwright/test";

test("Dashboard", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("bill.brasky");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("button", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Health" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Report a Problem" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Changelog" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();
});
