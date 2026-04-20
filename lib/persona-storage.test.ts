import { beforeEach, describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  clearPersona,
  readPersona,
  writePersona,
} from "./persona-storage";

describe("read/write/clearPersona (localStorage)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a persona", () => {
    writePersona("ang");
    expect(readPersona()).toBe("ang");
  });

  it("returns null when no persona is set", () => {
    expect(readPersona()).toBeNull();
  });

  it("ignores unknown values in the slot (tamper-safe)", () => {
    window.localStorage.setItem(STORAGE_KEY, "elvis");
    expect(readPersona()).toBeNull();
  });

  it("clearPersona removes the persona key", () => {
    writePersona("tony");
    clearPersona();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(readPersona()).toBeNull();
  });

  it("writePersona overwrites an earlier choice in place", () => {
    writePersona("ang");
    writePersona("carly");
    expect(readPersona()).toBe("carly");
    // Exactly one persona entry — no accumulation.
    let count = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.includes("spain_persona")) count++;
    }
    expect(count).toBe(1);
  });

  it("does not touch non-persona keys", () => {
    window.localStorage.setItem("spain-bookings", JSON.stringify({ foo: 1 }));
    writePersona("ang");
    clearPersona();
    expect(window.localStorage.getItem("spain-bookings")).not.toBeNull();
  });
});

describe("persistence across days", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persona set once survives indefinitely — no date-based rollover", () => {
    // Simulate writing the persona "yesterday" (the clock is irrelevant now
    // that the storage key is not date-keyed). What matters is that a later
    // read returns the same value without any day-boundary parameter.
    writePersona("charles");
    expect(readPersona()).toBe("charles");
    // A subsequent read — in a new JS tick, a new day, a new trip — still
    // finds the same value. No sweep has happened.
    expect(readPersona()).toBe("charles");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("charles");
  });
});

describe("legacy-key migration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("promotes the most-recent legacy date-keyed value to the new key", () => {
    // Two legacy entries from pre-NEG-71 builds. The lexicographically
    // highest suffix is the freshest.
    window.localStorage.setItem("spain_persona_20260515", "tony");
    window.localStorage.setItem("spain_persona_20260520", "carly");

    expect(readPersona()).toBe("carly");
    // The new key is populated.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("carly");
    // And both legacy keys are cleaned up.
    expect(window.localStorage.getItem("spain_persona_20260515")).toBeNull();
    expect(window.localStorage.getItem("spain_persona_20260520")).toBeNull();
  });

  it("is a no-op once there are no legacy keys", () => {
    writePersona("ang");
    // Second read hits the new key directly; no legacy traversal needed.
    expect(readPersona()).toBe("ang");
    // Still exactly one persona entry.
    let count = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.includes("spain_persona")) count++;
    }
    expect(count).toBe(1);
  });

  it("preserves a fresh new-key choice and still sweeps legacy keys", () => {
    // Simulates an upgrade where the user already made a fresh pick under
    // the new key before the migration path ran.
    window.localStorage.setItem(STORAGE_KEY, "ang");
    window.localStorage.setItem("spain_persona_20260515", "tony");

    expect(readPersona()).toBe("ang");
    // Legacy swept regardless.
    expect(window.localStorage.getItem("spain_persona_20260515")).toBeNull();
    // New key untouched.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("ang");
  });

  it("ignores legacy entries that contain garbage values", () => {
    window.localStorage.setItem("spain_persona_20260515", "elvis");
    expect(readPersona()).toBeNull();
    // Garbage legacy key still gets swept.
    expect(window.localStorage.getItem("spain_persona_20260515")).toBeNull();
  });
});
