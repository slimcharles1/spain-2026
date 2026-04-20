import { expect, test } from "@playwright/test";

/**
 * /changes — Change of Plans page (NEG-72).
 *
 * Covers:
 *   - page loads with open + done sections
 *   - Mercado de San Miguel is the first open item
 *   - Linear link on an open item opens in a new tab
 *   - /changes is reachable from the bottom-nav Info tab
 */

async function authenticate(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[type="password"]', "sevilla");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/persona$/);
  await page.click('[data-testid="persona-tile-charles"]');
  await page.waitForURL(/\/schedule/);
}

test.describe("Change of Plans", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("/changes loads with open and done sections", async ({ page }) => {
    await page.goto("/changes");
    await expect(page).toHaveURL(/\/changes/);
    await expect(page.getByTestId("changes-title")).toHaveText("Change of Plans");
    await expect(page.getByTestId("section-open")).toBeVisible();
    await expect(page.getByTestId("section-done")).toBeVisible();
  });

  test("Mercado de San Miguel is the first open item", async ({ page }) => {
    await page.goto("/changes");
    const openCards = page.getByTestId("change-open-card");
    await expect(openCards.first()).toHaveAttribute(
      "data-change-id",
      "mercado-san-miguel"
    );
    await expect(openCards.first()).toContainText("Mercado de San Miguel");
  });

  test("clicking a Linear link on an open item opens a new tab", async ({
    context,
    page,
  }) => {
    await page.goto("/changes");
    const cta = page.getByTestId("change-open-card-cta").first();
    await expect(cta).toHaveAttribute("target", "_blank");

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      cta.click({ modifiers: [] }),
    ]);
    await popup.waitForLoadState("domcontentloaded").catch(() => {});
    expect(popup.url()).toContain("linear.app");
  });

  test("Info tab in the bottom nav routes to /changes", async ({ page }) => {
    await page.goto("/schedule");
    // The legacy bottom nav labels the tab "Info"; it points at /changes.
    await page.click('a[href="/changes"]');
    await expect(page).toHaveURL(/\/changes/);
    await expect(page.getByTestId("changes-title")).toBeVisible();
  });
});
