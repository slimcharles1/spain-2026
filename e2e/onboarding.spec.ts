import { expect, test } from "@playwright/test";

/**
 * NEG-67 onboarding flow:
 *   - Fresh visit → /login
 *   - Wrong password → error, still on /login
 *   - Correct password → /persona
 *   - Tap Ang → /schedule, persona persisted in localStorage
 *   - Fresh cookie but no persona → /persona
 *   - Mocked next-Madrid-day → persona picker reappears
 *
 * Requires TRIP_PASSWORD=sevilla in the test env.
 */

test.describe("onboarding", () => {
  test("fresh visit to / redirects to /login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("wrong password shows an error and stays on /login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "madrid");
    await page.click('button[type="submit"]');
    await expect(
      page.getByRole("alert").filter({ hasText: /wrong password/i })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("correct password routes to /persona", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    await expect(page.getByTestId("persona-page")).toBeVisible();
  });

  test("tap Ang routes to /schedule and persists persona", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    await page.click('[data-testid="persona-tile-ang"]');
    await page.waitForURL(/\/schedule/);

    // Persona is stored in localStorage under today's Madrid date key.
    const stored = await page.evaluate(() => {
      const entries: Record<string, string | null> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith("spain_persona_")) {
          entries[k] = window.localStorage.getItem(k);
        }
      }
      return entries;
    });
    const values = Object.values(stored);
    expect(values).toContain("ang");
  });

  test("authed but no persona → redirected to /persona from root", async ({
    page,
  }) => {
    // Ensure we are authed but have no persona selected.
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    // Clear persona and head to root.
    await page.evaluate(() => {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith("spain_persona_")) {
          window.localStorage.removeItem(k);
          i--;
        }
      }
    });
    await page.goto("/");
    await page.waitForURL(/\/persona$/);
    await expect(page.getByTestId("persona-page")).toBeVisible();
  });

  test("next Madrid day re-prompts for persona", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    await page.click('[data-testid="persona-tile-carly"]');
    await page.waitForURL(/\/schedule/);

    // Simulate that "today's Madrid date" has advanced by stamping a persona
    // under a past-date key only, and removing the current-day key.
    await page.evaluate(() => {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith("spain_persona_")) {
          window.localStorage.removeItem(k);
          i--;
        }
      }
      // Store under a fake historical date so readPersona() returns null today.
      window.localStorage.setItem("spain_persona_19990101", "carly");
    });

    await page.goto("/");
    await page.waitForURL(/\/persona$/);
    await expect(page.getByTestId("persona-page")).toBeVisible();
  });
});
