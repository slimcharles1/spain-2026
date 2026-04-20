import { test, expect, type Page } from "@playwright/test";

/**
 * NEG-65 · Schedule screen flows.
 *
 * Require NEG-64 (design tokens + DayPill + Badge etc.) to be merged; the
 * schedule won't render the new UI without those imports.
 */

async function authenticate(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="password"]', "realmadrid");
  await page.click('button[type="submit"]');
  await page.waitForURL("/", { timeout: 5000 });
}

test.describe("NEG-65 Schedule — Today", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("Today renders header + day picker", async ({ page }) => {
    await page.goto("/schedule?day=1");
    await expect(page.getByTestId("schedule-hero")).toContainText(/\w+/);
    await expect(page.getByTestId("day-picker")).toBeVisible();
  });

  test("day picker switches content", async ({ page }) => {
    await page.goto("/schedule?day=1");
    await expect(page.getByTestId("schedule-hero")).toContainText("Arrive Madrid");
    await page
      .getByTestId("day-picker")
      .getByRole("button", { name: /Day 2/ })
      .click();
    await expect(page.getByTestId("schedule-hero")).toContainText(/Sevilla|Seville/);
  });

  test("tap event dispatches open-event", async ({ page }) => {
    await page.goto("/schedule?day=1");
    await page.evaluate(() => {
      (window as unknown as { __openEventFired: boolean }).__openEventFired = false;
      window.addEventListener("open-event", () => {
        (window as unknown as { __openEventFired: boolean }).__openEventFired = true;
      });
    });
    await page.getByTestId("event-card").first().click();
    const fired = await page.evaluate(
      () => (window as unknown as { __openEventFired: boolean }).__openEventFired
    );
    expect(fired).toBe(true);
  });
});

test.describe("NEG-65 Schedule — Day 2 (match card)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto("/schedule?day=2");
  });

  test("renders match card with both teams", async ({ page }) => {
    const matchCard = page.getByTestId("match-card");
    await expect(matchCard).toBeVisible();
    await expect(page.getByTestId("match-home")).toContainText(/SEVILLA/i);
    await expect(page.getByTestId("match-away")).toContainText(/REAL MADRID/i);
  });

  test("match card shows guys-only attendees", async ({ page }) => {
    const matchCard = page.getByTestId("match-card");
    await expect(matchCard.getByTestId("attendees-row")).toContainText(/GUYS ONLY/i);
  });

  test("match card has tickets + directions CTAs", async ({ page }) => {
    await expect(page.getByTestId("match-tickets")).toBeVisible();
    await expect(page.getByTestId("match-directions")).toBeVisible();
  });
});

test.describe("NEG-65 Schedule — Day 3 (multi-city)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto("/schedule?day=3");
  });

  test("route indicator renders", async ({ page }) => {
    await expect(page.getByTestId("route-indicator")).toBeVisible();
  });

  test("route shows 4 stops (Sevilla → Jerez → Cádiz → Sevilla)", async ({ page }) => {
    await expect(page.getByTestId("route-stop")).toHaveCount(4);
  });
});
