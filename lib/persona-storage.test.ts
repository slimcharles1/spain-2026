import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPersona,
  madridDateKey,
  readPersona,
  storageKey,
  writePersona,
} from "./persona-storage";

describe("madridDateKey", () => {
  it("formats as YYYYMMDD", () => {
    const d = new Date("2026-05-16T10:00:00Z");
    // 10:00 UTC on 2026-05-16 is 12:00 Madrid (CEST, UTC+2) → 20260516
    expect(madridDateKey(d)).toBe("20260516");
  });

  it("rolls over at Madrid midnight (not UTC midnight)", () => {
    // 2026-05-16 22:30 UTC == 2026-05-17 00:30 Madrid (CEST, UTC+2).
    const beforeMadridMidnight = new Date("2026-05-16T21:59:00Z"); // 23:59 Madrid
    const afterMadridMidnight = new Date("2026-05-16T22:01:00Z"); // 00:01 Madrid next day
    expect(madridDateKey(beforeMadridMidnight)).toBe("20260516");
    expect(madridDateKey(afterMadridMidnight)).toBe("20260517");
  });

  it("stays on the same day right up to Madrid midnight", () => {
    // 2026-05-16 21:30 UTC == 2026-05-16 23:30 Madrid (CEST).
    const d = new Date("2026-05-16T21:30:00Z");
    expect(madridDateKey(d)).toBe("20260516");
  });

  it("storageKey is prefixed with spain_persona_", () => {
    const d = new Date("2026-05-16T12:00:00Z");
    expect(storageKey(d)).toBe("spain_persona_20260516");
  });
});

describe("read/write/clearPersona (localStorage)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a persona for today's Madrid date", () => {
    const d = new Date("2026-05-16T12:00:00Z");
    writePersona("ang", d);
    expect(readPersona(d)).toBe("ang");
  });

  it("returns null when no persona is set", () => {
    expect(readPersona(new Date("2026-05-16T12:00:00Z"))).toBeNull();
  });

  it("ignores personas stored under a different Madrid date", () => {
    const day1 = new Date("2026-05-16T12:00:00Z");
    const day2 = new Date("2026-05-17T12:00:00Z");
    writePersona("charles", day1);
    // On day 2, the day-1 key no longer matches.
    expect(readPersona(day2)).toBeNull();
  });

  it("ignores unknown values in the slot (tamper-safe)", () => {
    const d = new Date("2026-05-16T12:00:00Z");
    window.localStorage.setItem(storageKey(d), "elvis");
    expect(readPersona(d)).toBeNull();
  });

  it("clearPersona removes today's key without touching others", () => {
    const day1 = new Date("2026-05-16T12:00:00Z");
    const day2 = new Date("2026-05-17T12:00:00Z");
    writePersona("tony", day1);
    // Simulate a pre-existing entry under a later date we shouldn't stomp on.
    window.localStorage.setItem(storageKey(day2), "carly");
    clearPersona(day1);
    expect(window.localStorage.getItem(storageKey(day1))).toBeNull();
    expect(window.localStorage.getItem(storageKey(day2))).toBe("carly");
  });

  it("writePersona sweeps stale keys from previous days", () => {
    const yesterday = new Date("2026-05-15T12:00:00Z");
    const today = new Date("2026-05-16T12:00:00Z");
    writePersona("ang", yesterday);
    expect(window.localStorage.getItem(storageKey(yesterday))).toBe("ang");
    writePersona("carly", today);
    // The yesterday key is garbage-collected so localStorage doesn't grow.
    expect(window.localStorage.getItem(storageKey(yesterday))).toBeNull();
    expect(window.localStorage.getItem(storageKey(today))).toBe("carly");
  });

  it("does not touch non-persona keys during sweep", () => {
    const yesterday = new Date("2026-05-15T12:00:00Z");
    const today = new Date("2026-05-16T12:00:00Z");
    window.localStorage.setItem("spain-bookings", JSON.stringify({ foo: 1 }));
    writePersona("ang", yesterday);
    writePersona("tony", today);
    expect(window.localStorage.getItem("spain-bookings")).not.toBeNull();
  });
});

describe("Madrid-midnight rollover", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persona set before Madrid midnight does not survive into the next Madrid day", () => {
    const beforeMidnight = new Date("2026-05-16T21:30:00Z"); // 23:30 Madrid
    const afterMidnight = new Date("2026-05-16T22:30:00Z"); // 00:30 Madrid next day
    writePersona("charles", beforeMidnight);
    expect(readPersona(beforeMidnight)).toBe("charles");
    // Same localStorage, new Madrid day → persona picker will re-prompt.
    expect(readPersona(afterMidnight)).toBeNull();
  });
});
