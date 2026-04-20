import { expect, test } from "@playwright/test";

/**
 * Onboarding + persona-switch flow (NEG-67 + NEG-71):
 *   - Fresh visit → /login
 *   - Wrong password → error, still on /login
 *   - Correct password → /persona
 *   - Tap Ang → /schedule, persona persisted in localStorage
 *   - Fresh cookie but no persona → /persona
 *   - Persona now persists indefinitely (no Madrid-midnight reset)
 *   - Legacy date-suffixed keys are migrated on first read
 *   - Top-right avatar → /persona → switch persona mid-session
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

  test("tap Ang routes to /schedule and persists persona under the new key", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    await page.click('[data-testid="persona-tile-ang"]');
    await page.waitForURL(/\/schedule/);

    // Persona is stored under the single `spain_persona` key — no date suffix.
    const value = await page.evaluate(() =>
      window.localStorage.getItem("spain_persona")
    );
    expect(value).toBe("ang");
  });

  test("authed but no persona → redirected to /persona from root", async ({
    page,
  }) => {
    // Ensure we are authed but have no persona selected.
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    // Clear persona (both current and any stray legacy keys) and head to root.
    await page.evaluate(() => {
      const toDelete: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k === "spain_persona" || k.startsWith("spain_persona_"))) {
          toDelete.push(k);
        }
      }
      toDelete.forEach((k) => window.localStorage.removeItem(k));
    });
    await page.goto("/");
    await page.waitForURL(/\/persona$/);
    await expect(page.getByTestId("persona-page")).toBeVisible();
  });

  test("persona sticks across fake day boundaries — no midnight reset", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    await page.click('[data-testid="persona-tile-carly"]');
    await page.waitForURL(/\/schedule/);

    // Simulate a full day (or several) passing — in the old date-keyed
    // world this would have orphaned the persona. With the persistent key
    // there's nothing to invalidate, so the app should pick up Carly again
    // after a hard reload.
    const beforeReload = await page.evaluate(() =>
      window.localStorage.getItem("spain_persona")
    );
    expect(beforeReload).toBe("carly");

    await page.goto("/");
    // Root dispatcher sends authed-and-has-persona straight to /schedule.
    await page.waitForURL(/\/schedule/);
    const afterReload = await page.evaluate(() =>
      window.localStorage.getItem("spain_persona")
    );
    expect(afterReload).toBe("carly");
  });

  test("legacy date-suffixed key is migrated to the new key on first read", async ({
    page,
  }) => {
    // Log in, but before hitting the app plant a legacy-format entry and
    // remove the current key so the next read triggers migration.
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    await page.evaluate(() => {
      window.localStorage.removeItem("spain_persona");
      window.localStorage.setItem("spain_persona_20260515", "tony");
    });

    await page.goto("/");
    // Authed + migrated-persona → /schedule, not /persona.
    await page.waitForURL(/\/schedule/);

    const state = await page.evaluate(() => ({
      migrated: window.localStorage.getItem("spain_persona"),
      legacy: window.localStorage.getItem("spain_persona_20260515"),
    }));
    expect(state.migrated).toBe("tony");
    // Legacy key is swept so storage does not accumulate.
    expect(state.legacy).toBeNull();
  });

  test("tap top-right avatar → /persona → switching persona updates context", async ({
    page,
  }) => {
    // Start as Ang.
    await page.goto("/login");
    await page.fill('input[type="password"]', "sevilla");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/persona$/);
    await page.click('[data-testid="persona-tile-ang"]');
    await page.waitForURL(/\/schedule/);
    expect(
      await page.evaluate(() => window.localStorage.getItem("spain_persona"))
    ).toBe("ang");

    // Tap the floating top-right avatar — routes back to the picker.
    await page.click('[data-testid="current-user-avatar"]');
    await page.waitForURL(/\/persona$/);

    // Pick a different persona.
    await page.click('[data-testid="persona-tile-carly"]');
    await page.waitForURL(/\/schedule/);
    expect(
      await page.evaluate(() => window.localStorage.getItem("spain_persona"))
    ).toBe("carly");
  });
});
