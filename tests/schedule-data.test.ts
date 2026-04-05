import { describe, it, expect } from "vitest";
import { tripDays } from "@/lib/schedule-data";

describe("schedule-data", () => {
  it("has 7 trip days", () => {
    expect(tripDays).toHaveLength(7);
  });

  it("days are numbered 1-7", () => {
    const numbers = tripDays.map((d) => d.dayNumber);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("all days have events", () => {
    for (const day of tripDays) {
      expect(day.events.length).toBeGreaterThan(0);
    }
  });

  it("all events have unique ids", () => {
    const allIds = tripDays.flatMap((d) => d.events.map((e) => e.id));
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it("events within each day are in chronological order", () => {
    for (const day of tripDays) {
      for (let i = 1; i < day.events.length; i++) {
        const prev = day.events[i - 1].time;
        const curr = day.events[i].time;
        expect(curr >= prev).toBe(true);
      }
    }
  });

  it("all events have valid time format HH:MM", () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    for (const day of tripDays) {
      for (const event of day.events) {
        expect(event.time).toMatch(timeRegex);
      }
    }
  });

  it("all events have a valid type", () => {
    const validTypes = ["travel", "dining", "wine", "culture", "activity", "hotel", "sport", "free"];
    for (const day of tripDays) {
      for (const event of day.events) {
        expect(validTypes).toContain(event.type);
      }
    }
  });

  it("dates are in May 2026", () => {
    for (const day of tripDays) {
      expect(day.date).toMatch(/^2026-05-/);
    }
  });
});
