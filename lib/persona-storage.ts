/**
 * Persona storage — single persistent key.
 *
 * Rationale: persona is a preference, not a day-bounded session. Once a
 * traveler picks who they are on a device, the choice survives closing the
 * app and crossing day boundaries. The auth cookie already persists for 90
 * days; persona now matches that lifetime. Switching is one tap on the
 * top-right avatar (see `<CurrentUserAvatar />`).
 *
 * Legacy: earlier builds (NEG-67 era) keyed persona by Europe/Madrid date
 * under `spain_persona_YYYYMMDD`. On first read we migrate the freshest
 * legacy key into `spain_persona` and sweep the rest.
 */

export type Persona = "ang" | "carly" | "charles" | "tony";

export const PERSONAS: readonly Persona[] = [
  "ang",
  "carly",
  "charles",
  "tony",
] as const;

/** Current storage key — no date suffix, persists indefinitely. */
export const STORAGE_KEY = "spain_persona";

/** Legacy date-suffixed prefix, used only by the one-shot migration. */
const LEGACY_KEY_PREFIX = "spain_persona_";

function isPersona(value: string | null): value is Persona {
  return !!value && (PERSONAS as readonly string[]).includes(value);
}

/**
 * Scan localStorage for any `spain_persona_<date>` keys, pick the one with
 * the highest date suffix (lexicographic works for YYYYMMDD), copy its
 * value to `spain_persona`, and remove every legacy key.
 *
 * Runs on demand from `readPersona`. Idempotent: once no legacy keys remain
 * it is a no-op.
 *
 * Returns the migrated persona value if the new key was not already
 * populated and a legacy value was promoted; otherwise null.
 */
function migrateLegacyKeys(): Persona | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    let bestKey: string | null = null;
    let bestValue: string | null = null;
    const legacyKeys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (!k || !k.startsWith(LEGACY_KEY_PREFIX)) continue;
      legacyKeys.push(k);
      if (bestKey === null || k > bestKey) {
        bestKey = k;
        bestValue = storage.getItem(k);
      }
    }
    if (legacyKeys.length === 0) return null;

    // Only promote the legacy value if the new key is empty. Otherwise the
    // user has already made a fresh choice under the new key and we should
    // preserve it while still sweeping the old keys.
    const existing = storage.getItem(STORAGE_KEY);
    let promoted: Persona | null = null;
    if (!existing && isPersona(bestValue)) {
      storage.setItem(STORAGE_KEY, bestValue);
      promoted = bestValue;
    }
    legacyKeys.forEach((k) => storage.removeItem(k));
    return promoted;
  } catch {
    return null;
  }
}

export function readPersona(): Persona | null {
  if (typeof window === "undefined") return null;
  try {
    // Always run the migration sweep. It is cheap (one pass over
    // localStorage keys), a no-op once legacy keys are gone, and keeps
    // storage tidy even when the new key is already populated.
    const migrated = migrateLegacyKeys();
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? migrated;
    return isPersona(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writePersona(persona: Persona): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, persona);
  } catch {
    // localStorage unavailable — persistence is best-effort.
  }
}

export function clearPersona(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
