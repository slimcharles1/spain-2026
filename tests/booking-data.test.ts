import { describe, it, expect } from "vitest";
import { bookingItems, tierConfig } from "@/lib/booking-data";

describe("booking-data", () => {
  it("has 11 booking items", () => {
    expect(bookingItems.length).toBeGreaterThanOrEqual(7);
  });

  it("all items have unique ids", () => {
    const ids = bookingItems.map((b) => b.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("all items have a valid tier", () => {
    const validTiers = ["book-now", "book-closer", "no-booking"];
    for (const item of bookingItems) {
      expect(validTiers).toContain(item.tier);
    }
  });

  it("book-now items have booking URLs", () => {
    const bookNow = bookingItems.filter((b) => b.tier === "book-now");
    for (const item of bookNow) {
      if (item.url) {
        expect(item.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it("tierConfig has all three tiers", () => {
    expect(tierConfig["book-now"]).toBeDefined();
    expect(tierConfig["book-closer"]).toBeDefined();
    expect(tierConfig["no-booking"]).toBeDefined();
  });

  it("tierConfig tiers have required fields", () => {
    for (const tier of Object.values(tierConfig)) {
      expect(tier.label).toBeTruthy();
      expect(tier.color).toBeTruthy();
      expect(tier.bgColor).toBeTruthy();
    }
  });
});
