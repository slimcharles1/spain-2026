import { expect, test } from "@playwright/test";

/**
 * After NEG-67 the auth contract changed: the shared password is now
 * TRIP_PASSWORD (env, value `sevilla`) and the post-login flow is
 * login → persona → schedule. The narrow checks here make sure the rest
 * of the app still works once a persona is chosen.
 */

async function authenticate(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[type="password"]', "sevilla");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/persona$/);
  await page.click('[data-testid="persona-tile-charles"]');
  await page.waitForURL(/\/schedule/);
}

test.describe("Authentication smoke", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page shows SPAIN wordmark", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("SPAIN");
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("rejects wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(
      page.getByRole("alert").filter({ hasText: /wrong password/i })
    ).toBeVisible();
  });
});

test.describe("Navigation (post-onboarding)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("schedule is reachable", async ({ page }) => {
    await page.click('a[href="/schedule"]');
    await expect(page).toHaveURL(/\/schedule/);
  });

  test("bookings is reachable", async ({ page }) => {
    await page.click('a[href="/bookings"]');
    await expect(page).toHaveURL(/\/bookings/);
  });

  test("expenses is reachable", async ({ page }) => {
    await page.click('a[href="/expenses"]');
    await expect(page).toHaveURL(/\/expenses/);
  });
});

test.describe("Schedule Page", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto("/schedule");
  });

  test("renders after onboarding", async ({ page }) => {
    await expect(page).toHaveURL(/\/schedule/);
    // The bottom nav returns on /schedule (it was hidden on /login and
    // /persona), which is a reliable post-onboarding signal.
    await expect(page.locator("nav")).toBeVisible();
  });
});
