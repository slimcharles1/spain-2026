"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  PERSONAS,
  clearPersona,
  madridDateKey,
  readPersona,
  storageKey,
  writePersona,
  type Persona,
} from "./persona-storage";

export type { Persona };
export { PERSONAS };

type AuthContextValue = {
  /** True when the trip password cookie is present. */
  isAuthed: boolean;
  /** Which traveler is actively using the device today, or null. */
  currentUser: Persona | null;
  /** True after the client has hydrated from cookie + localStorage. */
  hydrated: boolean;
  setCurrentUser: (user: Persona) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The server sets two cookies on successful login:
 *   - `trip_auth=1` (httpOnly) — consumed by proxy.ts / server code.
 *   - `trip_auth_present=1` (readable) — lets the client tell whether it
 *     is authed without a network roundtrip.
 */
function readAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith("trip_auth_present=1"));
}

// --- External-store glue -----------------------------------------------------
// We keep two client-only signals (auth cookie + persona for today's Madrid
// date) outside React via `useSyncExternalStore`. This is the blessed pattern
// for hydrating from non-server data without tripping the React 19 "don't set
// state in an effect" rule.

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getAuthSnapshot = () => (readAuthCookie() ? "1" : "0");
const getAuthServerSnapshot = () => "0";
const getPersonaSnapshot = () => readPersona() ?? "";
const getPersonaServerSnapshot = () => "";

type AuthProviderProps = {
  children: ReactNode;
  /** Optional override for tests. */
  initialAuthed?: boolean;
};

export function AuthProvider({ children, initialAuthed }: AuthProviderProps) {
  const authSnapshot = useSyncExternalStore(
    subscribe,
    getAuthSnapshot,
    getAuthServerSnapshot
  );
  const personaSnapshot = useSyncExternalStore(
    subscribe,
    getPersonaSnapshot,
    getPersonaServerSnapshot
  );
  const isAuthed = initialAuthed ?? authSnapshot === "1";
  const currentUser: Persona | null = personaSnapshot
    ? (personaSnapshot as Persona)
    : null;

  // `hydrated` flips true once the first client render has produced real
  // snapshots (as opposed to the SSR defaults). Consumers use this to avoid
  // flashing the wrong content during the initial render pass. Built on
  // useSyncExternalStore so the transition happens without an in-effect
  // setState (which the React 19 lint rules forbid).
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  // Watch for Madrid-date rollover while the tab is open. A minute-resolution
  // poll catches midnight within 60 s — good enough for a trip companion.
  useEffect(() => {
    let lastKey = storageKey();
    const interval = window.setInterval(() => {
      const k = storageKey();
      if (k !== lastKey) {
        lastKey = k;
        // Day changed — any persona under the old key no longer applies.
        notify();
      }
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const setCurrentUser = useCallback((user: Persona) => {
    writePersona(user);
    notify();
  }, []);

  const logout = useCallback(async () => {
    clearPersona();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best effort
    }
    notify();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthed, currentUser, hydrated, setCurrentUser, logout }),
    [isAuthed, currentUser, hydrated, setCurrentUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

/** Exposed for tests / callers that want the raw Madrid date key. */
export { madridDateKey };
