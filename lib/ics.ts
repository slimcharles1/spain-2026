// Minimal RFC 5545 .ics generator for a single VEVENT.
// Used by the Event Detail Modal "Add to Cal" action.
//
// We emit floating local times in Europe/Madrid (DTSTART;TZID=Europe/Madrid)
// rather than UTC so the event lands correctly on the user's calendar
// regardless of where they import it from.

export interface IcsEventInput {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  /** ISO-ish date `YYYY-MM-DD` */
  date: string;
  /** `HH:MM` 24h in Europe/Madrid */
  time: string;
  /** Optional duration minutes; defaults to 60. */
  durationMinutes?: number;
}

/** Escape a text value per RFC 5545 §3.3.11. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** Fold a long line at 75 octets per RFC 5545 §3.1. */
export function foldIcsLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let idx = 0;
  // First line: 75 chars; continuation: 74 chars (plus leading space).
  parts.push(line.slice(0, 75));
  idx = 75;
  while (idx < line.length) {
    parts.push(" " + line.slice(idx, idx + 74));
    idx += 74;
  }
  return parts.join("\r\n");
}

function formatLocal(date: string, time: string): string {
  // "2026-05-17" + "20:30" → "20260517T203000"
  const [y, m, d] = date.split("-");
  const [hh, mm] = time.split(":");
  return `${y}${m}${d}T${hh ?? "00"}${mm ?? "00"}00`;
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const t = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0));
  t.setUTCMinutes(t.getUTCMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`,
    time: `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`,
  };
}

function dtstamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T` +
    `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  );
}

/** Build a valid .ics string for a single event. CRLF line endings. */
export function buildIcs(input: IcsEventInput): string {
  const dur = input.durationMinutes ?? 60;
  const end = addMinutes(input.date, input.time, dur);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Spain 2026//NEG-66//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(input.uid)}@spain-2026.app`,
    `DTSTAMP:${dtstamp()}`,
    `DTSTART;TZID=Europe/Madrid:${formatLocal(input.date, input.time)}`,
    `DTEND;TZID=Europe/Madrid:${formatLocal(end.date, end.time)}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
  ];
  if (input.description) lines.push(`DESCRIPTION:${escapeIcsText(input.description)}`);
  if (input.location) lines.push(`LOCATION:${escapeIcsText(input.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/** Trigger a browser download of the .ics blob. No-op server-side. */
export function downloadIcs(input: IcsEventInput): void {
  if (typeof window === "undefined") return;
  const ics = buildIcs(input);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(input.title)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "event";
}
