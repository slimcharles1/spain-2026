import { expect, test } from "@playwright/test";

/**
 * /home — Landing page (NEG-73).
 *
 * Covers:
 *   - Root dispatcher sends authed + persona-ed users to /home (not /schedule)
 *   - Hero wordmark + greeting render
 *   - Directory rows link to the four primary sections
 *   - Bottom-nav HOME tab routes back to /home
 */

/**
 * Sign in and pick a persona. Persona selection itself still routes to
 * /schedule (unchanged by NEG-73) — it's the root dispatcher that now
 * lands authed+persona users on /home.
 */
async function authenticate(
  page: import("@playwright/test").Page,
  persona: "ang" | "carly" | "charles" | "tony"
) {
  await page.goto("/login");
  await page.fill('input[type="password"]', "sevilla");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/persona$/);
  await page.click(`[data-testid="persona-tile-${persona}"]`);
  await page.waitForURL(/\/schedule/);
}

test.describe("Home landing page", () => {
  test("root dispatcher routes authed + persona-ed user to /home", async ({
    page,
  }) => {
    await authenticate(page, "charles");
    // Hitting root with a persisted persona should now land on /home.
    await page.goto("/");
    await page.waitForURL(/\/home$/);
    await expect(page.getByTestId("home-page")).toBeVisible();
    await expect(page.getByTestId("home-wordmark")).toHaveText("SPAIN");
  });

  test("greeting shows the first name of the chosen persona", async ({
    page,
  }) => {
    await authenticate(page, "ang");
    await page.goto("/home");
    await expect(page.getByTestId("home-greeting")).toContainText("Hola, Ang.");
  });

  test("directory rows link to the four primary sections", async ({ page }) => {
    await authenticate(page, "carly");
    await page.goto("/home");

    await expect(page.getByTestId("home-directory-today")).toHaveAttribute(
      "href",
      "/schedule"
    );
    await expect(page.getByTestId("home-directory-bookings")).toHaveAttribute(
      "href",
      "/bookings"
    );
    await expect(page.getByTestId("home-directory-expenses")).toHaveAttribute(
      "href",
      "/expenses"
    );
    await expect(page.getByTestId("home-directory-changes")).toHaveAttribute(
      "href",
      "/changes"
    );
  });

  test("clicking the Today directory row routes to /schedule", async ({
    page,
  }) => {
    await authenticate(page, "tony");
    await page.goto("/home");
    await page.click('[data-testid="home-directory-today"]');
    await expect(page).toHaveURL(/\/schedule/);
  });

  test("HOW THIS WORKS tip list is rendered", async ({ page }) => {
    await authenticate(page, "charles");
    await page.goto("/home");
    await expect(page.getByTestId("home-how-it-works")).toBeVisible();
    await expect(page.getByTestId("home-how-it-works")).toContainText(
      "HOW THIS WORKS"
    );
  });

  test("bottom-nav Home tab routes back to /home from /schedule", async ({
    page,
  }) => {
    await authenticate(page, "charles");
    // Already on /schedule after persona select.
    await page.click('a[href="/home"]');
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByTestId("home-page")).toBeVisible();
  });
});
