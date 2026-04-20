"use client";

/**
 * /home — Landing page (NEG-73).
 *
 * The first screen an authed + persona-ed user sees. Quiet wordmark hero,
 * a personal greeting, a directory of the four main sections, and a short
 * "HOW THIS WORKS" tip list. Data reads live from lib/schedule-data.ts
 * and lib/changes-data.ts — no network.
 *
 * Layout / type scale follows the La Movida Refined design system
 * (see lib/design-tokens.ts). Hero wordmark is intentionally ~56px —
 * smaller than the 64px wordmark on /login so the greeting and directory
 * get first-glance attention.
 */

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { colors, eventTypes, personNames, radii } from "@/lib/design-tokens";
import { tripDays, type ScheduleEvent } from "@/lib/schedule-data";
import { CHANGES, openChanges } from "@/lib/changes-data";
import { useAuth } from "@/lib/auth-context";
import PosterStripe from "@/components/design-system/PosterStripe";

// ---------------------------------------------------------------------------
// Trip constants
// ---------------------------------------------------------------------------

const TRIP_START_ISO = "2026-05-16";
const TRIP_LENGTH = tripDays.length; // 7 days
const BUDGET_EUR = 3500;

// ---------------------------------------------------------------------------
// Madrid date snapshot via useSyncExternalStore
//
// Same pattern as /changes: keeps SSR output deterministic, swaps in the
// real Europe/Madrid date on hydration without a setState-in-effect.
// ---------------------------------------------------------------------------

const SERVER_DATE = "2026-04-19";
const SERVER_TIME = "12:00";

function subscribe() {
  return () => {};
}

function getMadridDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getMadridTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function useMadridToday(): string {
  return useSyncExternalStore(subscribe, getMadridDate, () => SERVER_DATE);
}

function useMadridNow(): string {
  return useSyncExternalStore(subscribe, getMadridTime, () => SERVER_TIME);
}

// ---------------------------------------------------------------------------
// Derivations
// ---------------------------------------------------------------------------

/**
 * Day X of N, where Day 1 is the trip-start date. Returns null if the trip
 * hasn't started yet or is already over.
 */
function tripDayNumber(todayIso: string): number | null {
  const start = new Date(`${TRIP_START_ISO}T00:00:00Z`).getTime();
  const today = new Date(`${todayIso}T00:00:00Z`).getTime();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  if (diff < 1 || diff > TRIP_LENGTH) return null;
  return diff;
}

function daysUntilTripStart(todayIso: string): number {
  const start = new Date(`${TRIP_START_ISO}T00:00:00Z`).getTime();
  const today = new Date(`${todayIso}T00:00:00Z`).getTime();
  return Math.max(0, Math.ceil((start - today) / (1000 * 60 * 60 * 24)));
}

function greetingLine(firstName: string, todayIso: string): string {
  const dayNum = tripDayNumber(todayIso);
  if (dayNum) {
    return `Hola, ${firstName}. Day ${dayNum} of ${TRIP_LENGTH}.`;
  }
  const days = daysUntilTripStart(todayIso);
  if (days > 0) {
    return `Hola, ${firstName}. Trip starts in ${days} day${days === 1 ? "" : "s"}.`;
  }
  // Trip is over — keep it graceful.
  return `Hola, ${firstName}. ¡Buen viaje!`;
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * "Next up" title for TODAY's directory row. If the trip is live and there's
 * a future event in today's schedule, use its title; otherwise fall back to
 * the first event of the current trip day, or a generic string.
 */
function nextUpTitle(todayIso: string, nowHHmm: string): string {
  const today = tripDays.find((d) => d.date === todayIso);
  if (today && today.events.length > 0) {
    const nowMin = timeToMinutes(nowHHmm);
    const upcoming = today.events.find((e) => timeToMinutes(e.time) >= nowMin);
    const pick: ScheduleEvent = upcoming ?? today.events[0];
    return pick.title;
  }
  // Pre-trip: show the first event of Day 1 as a preview.
  const firstDay = tripDays[0];
  return firstDay?.events[0]?.title ?? "Itinerary";
}

function bookingsCount(): number {
  let n = 0;
  for (const day of tripDays) {
    for (const e of day.events) {
      if (e.confirmation) n += 1;
    }
  }
  return n;
}

function openDecisionsCount(): number {
  return openChanges(CHANGES).length;
}

// ---------------------------------------------------------------------------
// Directory row
// ---------------------------------------------------------------------------

interface DirectoryRow {
  testId: string;
  href: string;
  barColor: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

function DirectoryRowLink({ row }: { row: DirectoryRow }) {
  return (
    <Link
      href={row.href}
      data-testid={row.testId}
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        background: colors.white,
        border: `1px solid ${colors.stroke}`,
        borderRadius: radii.lg,
        overflow: "hidden",
        textDecoration: "none",
        color: colors.ink,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 6,
          flex: "0 0 6px",
          background: row.barColor,
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontFamily: "var(--font-archivo-black)",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: colors.gray,
            }}
          >
            {row.eyebrow}
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.2,
              color: colors.ink,
            }}
          >
            {row.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 13,
              lineHeight: 1.35,
              color: colors.gray,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.subtitle}
          </div>
        </div>
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 18,
            color: colors.ink,
            opacity: 0.5,
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// HowItWorks tips
// ---------------------------------------------------------------------------

const TIPS: { label: string; body: string }[] = [
  {
    label: "ONE TAP",
    body: "Tap the avatar top-right to switch who's using this phone.",
  },
  {
    label: "LIVE",
    body: "Today updates in real time from Europe/Madrid — NOW, NEXT, LATER.",
  },
  {
    label: "OFFLINE",
    body: "Add to home screen — the app runs offline after the first load.",
  },
  {
    label: "DECIDE",
    body: "Open decisions live in INFO · Change of Plans. Weigh in, then settle it.",
  },
];

function HowItWorks() {
  return (
    <section
      data-testid="home-how-it-works"
      aria-labelledby="home-how-heading"
      style={{ padding: "24px 20px 0" }}
    >
      <h2
        id="home-how-heading"
        style={{
          fontFamily: "var(--font-archivo-black)",
          fontSize: 11,
          letterSpacing: "0.16em",
          color: colors.gray,
          textTransform: "uppercase",
          margin: "0 0 10px",
        }}
      >
        HOW THIS WORKS
      </h2>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {TIPS.map((tip) => (
          <li
            key={tip.label}
            style={{
              display: "flex",
              gap: 12,
              padding: 14,
              background: colors.cream,
              border: `1px solid ${colors.stroke}`,
              borderRadius: radii.lg,
            }}
          >
            <span
              style={{
                flex: "0 0 auto",
                minWidth: 56,
                fontFamily: "var(--font-archivo-black)",
                fontSize: 10,
                letterSpacing: "0.14em",
                color: colors.red,
                paddingTop: 2,
              }}
            >
              {tip.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                lineHeight: 1.45,
                color: colors.ink,
              }}
            >
              {tip.body}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { currentUser } = useAuth();
  const today = useMadridToday();
  const now = useMadridNow();

  // Persona is optional here (a first-load render before hydration may see
  // null). The root dispatcher will only route authed + persona-ed users to
  // /home, so the null branch is effectively SSR-only. Fallback gracefully.
  const firstName = currentUser ? personNames[currentUser] : "traveler";

  const rows: DirectoryRow[] = [
    {
      testId: "home-directory-today",
      href: "/schedule",
      barColor: eventTypes.sport.base, // cobalt
      eyebrow: "TODAY",
      title: "Today's schedule",
      subtitle: `Next up: ${nextUpTitle(today, now)}`,
    },
    {
      testId: "home-directory-bookings",
      href: "/bookings",
      barColor: eventTypes.hotel.base, // hotel teal
      eyebrow: "BOOKINGS",
      title: "Confirmations & tickets",
      subtitle: `${bookingsCount()} confirmations`,
    },
    {
      testId: "home-directory-expenses",
      href: "/expenses",
      barColor: eventTypes.dining.base, // dining amber
      eyebrow: "EXPENSES",
      title: "Shared expenses",
      // v1 placeholder — NEG-75 will wire Supabase and replace these numbers.
      subtitle: `€0 spent · €${BUDGET_EUR.toLocaleString("en-US")} remaining`,
    },
    {
      testId: "home-directory-changes",
      href: "/changes",
      barColor: eventTypes.wine.base, // wine rose
      eyebrow: "CHANGES",
      title: "Change of plans",
      subtitle: (() => {
        const n = openDecisionsCount();
        return `${n} open decision${n === 1 ? "" : "s"}`;
      })(),
    },
  ];

  return (
    <main
      data-testid="home-page"
      style={{
        minHeight: "100vh",
        background: colors.cream,
        fontFamily: "var(--font-inter)",
        color: colors.ink,
        paddingBottom: 96,
      }}
    >
      {/* Wordmark hero */}
      <header
        data-testid="home-hero"
        style={{
          padding: "32px 20px 16px",
          textAlign: "center",
        }}
      >
        <h1
          data-testid="home-wordmark"
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 56,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            margin: 0,
            color: colors.ink,
          }}
        >
          SPAIN
        </h1>
        <div style={{ margin: "8px auto", maxWidth: 240 }}>
          <PosterStripe height={5} />
        </div>
        <div
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 56,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: colors.red,
          }}
        >
          2026
        </div>
      </header>

      {/* Greeting */}
      <section
        data-testid="home-greeting"
        style={{ padding: "8px 20px 0", textAlign: "center" }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.3,
            color: colors.ink,
            margin: 0,
          }}
        >
          {greetingLine(firstName, today)}
        </p>
      </section>

      {/* Directory */}
      <section
        data-testid="home-directory"
        aria-labelledby="home-directory-heading"
        style={{ padding: "24px 20px 0" }}
      >
        <h2
          id="home-directory-heading"
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: colors.gray,
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}
        >
          DIRECTORY
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((row) => (
            <DirectoryRowLink key={row.testId} row={row} />
          ))}
        </div>
      </section>

      <HowItWorks />
    </main>
  );
}
