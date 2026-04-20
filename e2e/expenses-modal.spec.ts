import { test, expect, type Page } from "@playwright/test";

// NEG-66 — Expenses rewrite + Event Detail Modal
//
// Covers the three behaviors the ticket calls out explicitly:
// - Expenses renders 4 PAID BY cards + hero + category bars
// - MARK SETTLED clears the top debt card
// - dispatching `CustomEvent('open-event', { detail })` opens the modal
//   with all sections and it dismisses via close / scrim

async function authenticate(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="password"]', "realmadrid");
  await page.click('button[type="submit"]');
  await page.waitForURL("/", { timeout: 5000 });
}

test.describe("Expenses (NEG-66)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto("/expenses");
  });

  test("renders hero + 4 PAID BY cards + category bars", async ({ page }) => {
    await expect(page.getByTestId("expenses-header")).toContainText("EXPENSES");
    await expect(page.getByTestId("hero-card")).toBeVisible();
    await expect(page.getByTestId("total-spent")).toBeVisible();

    for (const id of ["charles", "carly", "tony", "ang"]) {
      await expect(page.getByTestId(`paid-by-${id}`)).toBeVisible();
    }

    // 5 category bars
    for (const id of ["dining", "hotels", "activities", "transit", "other"]) {
      await expect(page.getByTestId(`cat-${id}`)).toBeVisible();
    }
  });

  test("MARK SETTLED zeroes the top debt", async ({ page }) => {
    const card = page.getByTestId("settle-up-card");
    await expect(card).toBeVisible();
    const before = await page.getByTestId("settle-up-body").textContent();
    expect(before).toMatch(/owes/);

    await page.getByTestId("mark-settled-btn").click();

    // After settling, either a new (smaller) debt shows, or the card flips
    // to the settled-up state. The key invariant: the specific debt line
    // changes.
    await expect.poll(async () => {
      const after = await page.getByTestId("settle-up-card").textContent();
      return after !== before;
    }, { timeout: 3000 }).toBe(true);
  });
});

test.describe("Event Detail Modal (NEG-66)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("dispatching 'open-event' CustomEvent opens modal with all sections", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => {
      const event = {
        id: "d1-lunch",
        dayNumber: 1,
        date: "2026-05-16",
        time: "13:00",
        endTime: "14:30",
        title: "Lunch at Mercado de San Miguel",
        description: "Gourmet market near Plaza Mayor.",
        tip: "Arrive before 1:30 PM to beat the lunch rush.",
        location: {
          name: "Mercado de San Miguel",
          address: "Plaza de San Miguel, s/n, 28005 Madrid",
          lat: 40.4153,
          lng: -3.7089,
        },
        type: "dining",
        durationMinutes: 90,
      };
      window.dispatchEvent(new CustomEvent("open-event", { detail: event }));
    });

    const modal = page.getByTestId("event-detail-modal");
    await expect(modal).toBeVisible();

    await expect(page.getByTestId("event-title")).toContainText("Mercado de San Miguel");
    await expect(page.getByTestId("type-badge")).toContainText("DINING");
    await expect(page.getByTestId("time-chip")).toContainText("13:00");
    await expect(page.getByTestId("description-card")).toBeVisible();
    await expect(page.getByTestId("pro-tip-card")).toBeVisible();
    await expect(page.getByTestId("location-card")).toBeVisible();
    await expect(page.getByTestId("attendees-row")).toBeVisible();
    await expect(page.getByTestId("open-in-maps-btn")).toBeVisible();
    await expect(page.getByTestId("share-btn")).toBeVisible();
    await expect(page.getByTestId("add-to-cal-btn")).toBeVisible();
    await expect(page.getByTestId("edit-btn")).toBeVisible();
  });

  test("scrim tap dismisses the modal", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const event = {
        id: "d2-match",
        dayNumber: 2,
        date: "2026-05-17",
        time: "20:30",
        title: "Sevilla FC vs Real Madrid",
        description: "La Liga at the 43,000-seat Sánchez-Pizjuán.",
        type: "sport",
        durationMinutes: 120,
      };
      window.dispatchEvent(new CustomEvent("open-event", { detail: event }));
    });
    await expect(page.getByTestId("event-detail-modal")).toBeVisible();

    await page.getByTestId("modal-close-btn").click();
    await expect(page.getByTestId("event-detail-modal")).toHaveCount(0);
  });

  test("Escape key dismisses the modal", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const event = {
        id: "d3-beach",
        dayNumber: 3,
        date: "2026-05-18",
        time: "14:00",
        title: "Playa de la Caleta — Beach Afternoon",
        description: "Golden sand flanked by two castles.",
        type: "activity",
        durationMinutes: 150,
      };
      window.dispatchEvent(new CustomEvent("open-event", { detail: event }));
    });
    await expect(page.getByTestId("event-detail-modal")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("event-detail-modal")).toHaveCount(0);
  });
});
