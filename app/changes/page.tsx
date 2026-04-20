"use client";

/**
 * /changes — Change of Plans (NEG-72).
 *
 * Trip-level decision log: what's still being debated and what's been settled,
 * each with a short "why." Data lives in `lib/changes-data.ts` — swapping the
 * `CHANGES` array is the only edit required to add or update an entry.
 *
 * Layout follows the La Movida Refined design system: status bar, red ALL-CAPS
 * day label, poster stripe, big Archivo Black title, Inter subtitle, then the
 * two sections (open items + done). The global `<BottomNav />` rendered in
 * app/layout.tsx provides the bottom navigation.
 */

import { useSyncExternalStore } from "react";
import { colors } from "@/lib/design-tokens";
import { CHANGES, doneChanges, openChanges } from "@/lib/changes-data";
import PosterStripe from "@/components/design-system/PosterStripe";
import StatusBar from "@/components/design-system/StatusBar";
import ChangeOpenCard from "@/components/design-system/ChangeOpenCard";
import ChangeDoneCard from "@/components/design-system/ChangeDoneCard";
import { getSpainDateString } from "@/lib/time-utils";

const open = openChanges(CHANGES);
const done = doneChanges(CHANGES);

// Server snapshot — deterministic string so SSR doesn't mismatch hydration.
// Client takes over after hydration with the real Europe/Madrid date.
const SERVER_DATE = "2026-04-20";

function subscribe() {
  // No-op: the Madrid date is stable enough for a page render that we don't
  // need to re-subscribe. useSyncExternalStore still swaps in the client
  // value on hydration without triggering the "setState-in-effect" lint rule.
  return () => {};
}

function useTodayMadrid(): string {
  return useSyncExternalStore(
    subscribe,
    () => getSpainDateString(),
    () => SERVER_DATE
  );
}

export default function ChangesPage() {
  const today = useTodayMadrid();

  return (
    <main
      data-testid="changes-page"
      style={{
        minHeight: "100vh",
        background: colors.cream,
        fontFamily: "var(--font-inter)",
        color: colors.ink,
        paddingBottom: 96,
      }}
    >
      <StatusBar />

      <header style={{ padding: "12px 20px 16px" }}>
        <div
          data-testid="changes-day-label"
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: colors.red,
            textTransform: "uppercase",
          }}
        >
          CHANGES · {today}
        </div>
        <div style={{ marginTop: 10 }}>
          <PosterStripe />
        </div>
        <h1
          data-testid="changes-title"
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 28,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: colors.ink,
            margin: "14px 0 6px",
          }}
        >
          Change of Plans
        </h1>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.45,
            color: colors.gray,
            margin: 0,
          }}
        >
          What&apos;s still up for grabs + what&apos;s been decided
        </p>
      </header>

      {/* OPEN ITEMS */}
      {open.length > 0 && (
        <section
          data-testid="section-open"
          aria-labelledby="changes-open-heading"
          style={{ padding: "8px 20px 0" }}
        >
          <h2
            id="changes-open-heading"
            style={{
              fontFamily: "var(--font-archivo-black)",
              fontSize: 11,
              letterSpacing: "0.16em",
              color: colors.gray,
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            OPEN ITEMS
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {open.map((c) => (
              <ChangeOpenCard key={c.id} change={c} />
            ))}
          </div>
        </section>
      )}

      {/* DONE */}
      {done.length > 0 && (
        <section
          data-testid="section-done"
          aria-labelledby="changes-done-heading"
          style={{ padding: "24px 20px 0" }}
        >
          <h2
            id="changes-done-heading"
            style={{
              fontFamily: "var(--font-archivo-black)",
              fontSize: 11,
              letterSpacing: "0.16em",
              color: colors.gray,
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            DONE
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {done.map((c) => (
              <ChangeDoneCard key={c.id} change={c} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
