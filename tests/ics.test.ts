import { describe, expect, it } from "vitest";
import { buildIcs, escapeIcsText, foldIcsLine } from "@/lib/ics";

describe("escapeIcsText", () => {
  it("escapes commas, semicolons, backslashes, and newlines", () => {
    const raw = "a, b; c\\d\ne";
    expect(escapeIcsText(raw)).toBe("a\\, b\\; c\\\\d\\ne");
  });
});

describe("foldIcsLine", () => {
  it("keeps short lines untouched", () => {
    expect(foldIcsLine("short line")).toBe("short line");
  });

  it("folds lines longer than 75 octets with CRLF + space", () => {
    const long = "x".repeat(160);
    const folded = foldIcsLine(long);
    const lines = folded.split("\r\n");
    expect(lines.length).toBe(Math.ceil((160 - 75) / 74) + 1);
    expect(lines[0].length).toBe(75);
    // Every continuation line starts with a space.
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i].startsWith(" ")).toBe(true);
    }
  });
});

describe("buildIcs", () => {
  const base = {
    uid: "d2-match",
    title: "Sevilla FC vs Real Madrid",
    description: "La Liga at Sánchez-Pizjuán.",
    location: "Estadio Sánchez-Pizjuán",
    date: "2026-05-17",
    time: "20:30",
    durationMinutes: 120,
  };

  it("contains required RFC 5545 components", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:d2-match@spain-2026.app");
    expect(ics).toContain("DTSTART;TZID=Europe/Madrid:20260517T203000");
    expect(ics).toContain("DTEND;TZID=Europe/Madrid:20260517T223000");
    expect(ics).toContain("SUMMARY:Sevilla FC vs Real Madrid");
    expect(ics).toContain("LOCATION:Estadio Sánchez-Pizjuán");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("uses CRLF line endings", () => {
    const ics = buildIcs(base);
    expect(ics.includes("\r\n")).toBe(true);
    expect(ics.endsWith("\r\n")).toBe(true);
  });

  it("rolls forward correctly when duration crosses the hour", () => {
    const ics = buildIcs({ ...base, time: "23:50", durationMinutes: 30 });
    expect(ics).toContain("DTSTART;TZID=Europe/Madrid:20260517T235000");
    expect(ics).toContain("DTEND;TZID=Europe/Madrid:20260518T002000");
  });

  it("defaults to a 60-minute duration when omitted", () => {
    const ics = buildIcs({ ...base, durationMinutes: undefined });
    expect(ics).toContain("DTSTART;TZID=Europe/Madrid:20260517T203000");
    expect(ics).toContain("DTEND;TZID=Europe/Madrid:20260517T213000");
  });

  it("escapes commas and semicolons in user content", () => {
    const ics = buildIcs({ ...base, description: "Tapas, wine; olives" });
    expect(ics).toContain("DESCRIPTION:Tapas\\, wine\\; olives");
  });
});
