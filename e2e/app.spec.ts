import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows login page with Spain branding", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("SPAIN");
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("rejects wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Wrong password")).toBeVisible();
  });

  test("accepts correct password and redirects to home", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "realmadrid");
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 5000 });
    await expect(page.locator("h1")).toContainText("SPAIN");
  });
});

// Helper to authenticate before other tests
async function authenticate(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[type="password"]', "realmadrid");
  await page.click('button[type="submit"]');
  await page.waitForURL("/", { timeout: 5000 });
}

test.describe("Home Page (Pre-Trip)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("shows countdown and hero section", async ({ page }) => {
    await expect(page.locator("h1").first()).toContainText("SPAIN");
    await expect(page.locator("text=days to go")).toBeVisible();
  });

  test("shows booking progress", async ({ page }) => {
    await expect(page.locator("text=Bookings")).toBeVisible();
  });

  test("shows trip week preview", async ({ page }) => {
    await expect(page.locator("text=The Week Ahead")).toBeVisible();
    await expect(page.locator("text=Day 1")).toBeVisible();
    await expect(page.locator("text=Day 7")).toBeVisible();
  });

  test("shows weather cards", async ({ page }) => {
    await expect(page.locator("text=May Weather")).toBeVisible();
    await expect(page.locator("text=Madrid")).toBeVisible();
    await expect(page.locator("text=Seville")).toBeVisible();
  });

  test("shows Spanish phrases", async ({ page }) => {
    await expect(page.locator("text=Spanish Essentials")).toBeVisible();
    await expect(page.locator("text=La cuenta, por favor")).toBeVisible();
  });

  test("shows tips section", async ({ page }) => {
    await expect(page.locator("text=Know Before You Go")).toBeVisible();
  });

  test("shows bottom navigation", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("text=Home")).toBeVisible();
  });

  test("gear icon opens info modal", async ({ page }) => {
    // Click the gear icon (top-right button)
    await page.locator("button").filter({ has: page.locator("svg path") }).first().click();
    await expect(page.locator("text=Info")).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("navigates to schedule page", async ({ page }) => {
    await page.click('a[href="/schedule"]');
    await expect(page).toHaveURL(/\/schedule/);
  });

  test("navigates to bookings page", async ({ page }) => {
    await page.click('a[href="/bookings"]');
    await expect(page).toHaveURL(/\/bookings/);
  });

  test("navigates to expenses page", async ({ page }) => {
    await page.click('a[href="/expenses"]');
    await expect(page).toHaveURL(/\/expenses/);
  });
});

test.describe("Schedule Page", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto("/schedule");
  });

  test("shows day picker", async ({ page }) => {
    await expect(page.locator("text=Day 1")).toBeVisible();
    await expect(page.locator("text=Day 7")).toBeVisible();
  });

  test("shows timeline events", async ({ page }) => {
    // Should show events for the selected day
    await expect(page.locator('[class*="timeline"]').or(page.locator("text=Land at Madrid")).or(page.locator("text=Check in"))).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Bookings Page", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto("/bookings");
  });

  test("shows booking progress bar", async ({ page }) => {
    await expect(page.locator("text=/\\d+ of \\d+/")).toBeVisible();
  });

  test("shows booking tiers", async ({ page }) => {
    await expect(page.locator("text=Book Now")).toBeVisible();
  });
});

test.describe("Expenses Page", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto("/expenses");
  });

  test("shows settlement card", async ({ page }) => {
    await expect(page.locator("text=/settled up|owe/i")).toBeVisible();
  });

  test("shows add expense FAB", async ({ page }) => {
    // FAB button should be visible
    const fab = page.locator("button").filter({ hasText: "+" }).or(page.locator('[class*="fixed"]').filter({ hasText: "+" }));
    await expect(fab.first()).toBeVisible();
  });
});
