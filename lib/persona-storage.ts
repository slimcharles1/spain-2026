/**
 * Persona storage — keyed by Europe/Madrid date.
 *
 * Rationale: the persona picker should reappear each new Madrid day so
 * travelers confirm who is actively using the device. The storage key embeds
 * the current Madrid ISO date; on a new day the old key is orphaned and a
 * fresh pick is required.
 */

export type Persona = "ang" | "carly" | "charles" | "tony";

export const PERSONAS: readonly Persona[] = [
  "ang",
  "carly",
  "charles",
  "tony",
] as const;

const KEY_PREFIX = "spain_persona_";

/**
 * Return today's date in Europe/Madrid, formatted YYYYMMDD.
 * Uses Intl to handle DST correctly. `now` is injectable for tests.
 */
export function madridDateKey(now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA yields YYYY-MM-DD; strip the dashes.
  return fmt.format(now).replace(/-/g, "");
}

export function storageKey(now: Date = new Date()): string {
  return `${KEY_PREFIX}${madridDateKey(now)}`;
}

export function readPersona(now: Date = new Date()): Persona | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(now));
    if (raw && (PERSONAS as readonly string[]).includes(raw)) {
      return raw as Persona;
    }
    return null;
  } catch {
    return null;
  }
}

export function writePersona(persona: Persona, now: Date = new Date()): void {
  if (typeof window === "undefined") return;
  try {
    // Sweep older persona keys so localStorage doesn't accumulate forever.
    const currentKey = storageKey(now);
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX) && k !== currentKey) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
    window.localStorage.setItem(currentKey, persona);
  } catch {
    // localStorage unavailable — persistence is best-effort.
  }
}

export function clearPersona(now: Date = new Date()): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(now));
  } catch {
    // ignore
  }
}
