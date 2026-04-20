"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { tripDays, type ScheduleEvent } from "@/lib/schedule-data";
import {
  getSpainDateString,
  getSpainTimeString,
  getTripDayNumber,
} from "@/lib/time-utils";
import {
  buildRoute,
  formatDelta,
  minutesUntil,
  partitionDay,
} from "@/lib/schedule-state";
import { colors } from "@/lib/design-tokens";
import PosterStripe from "@/components/design-system/PosterStripe";
import DayPicker, {
  type DayPickerDay,
} from "@/components/design-system/DayPicker";
import EventCard from "@/components/design-system/EventCard";
import AttendeesRow from "@/components/design-system/AttendeesRow";
import RouteIndicator from "@/components/design-system/RouteIndicator";
import MatchCard from "@/components/design-system/MatchCard";

export default function SchedulePage() {
  return (
    <Suspense fallback={null}>
      <ScheduleContent />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_OF_WEEK_SHORT: Record<string, string> = {
  Sunday: "SUN",
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
};

function toPickerDays(): DayPickerDay[] {
  return tripDays.map((d) => {
    const [, , dd] = d.date.split("-");
    return {
      day: d.dayNumber,
      weekday: DAY_OF_WEEK_SHORT[d.weekday] ?? d.weekday.slice(0, 3).toUpperCase(),
      dayOfMonth: Number(dd),
    };
  });
}

// Tick every 60s to advance NOW/NEXT states.
function useMinutelyTick(): string {
  const [time, setTime] = useState<string>(() =>
    typeof window === "undefined" ? "00:00" : getSpainTimeString()
  );
  useEffect(() => {
    setTime(getSpainTimeString());
    const id = setInterval(() => setTime(getSpainTimeString()), 60_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ---------------------------------------------------------------------------
// Route derivation (Day 3 / Day 5 multi-city)
// ---------------------------------------------------------------------------

const DAY_ROUTES: Record<number, string[]> = {
  2: ["Madrid", "Sevilla"],
  3: ["Sevilla", "Jerez", "Cádiz", "Sevilla"],
  5: ["Sevilla", "Córdoba", "La Mancha", "Madrid"],
};

function getRouteForDay(
  dayNumber: number,
  events: ScheduleEvent[],
  now: ScheduleEvent | null
) {
  const cities = DAY_ROUTES[dayNumber];
  if (!cities) return null;

  const haystack =
    (now ?? events[0])?.location?.name ?? (now ?? events[0])?.title ?? "";
  const currentCityIndex = cities.findIndex((c) =>
    haystack.toLowerCase().includes(c.toLowerCase())
  );
  const nowIndex = currentCityIndex < 0 ? 0 : currentCityIndex;
  const sleepIndex = cities.length - 1;

  return buildRoute(cities, nowIndex, sleepIndex);
}

// ---------------------------------------------------------------------------
// Day 2 match-card config
// ---------------------------------------------------------------------------

const DAY_2_MATCH = {
  home: "Sevilla FC",
  away: "Real Madrid",
  kickoff: "20:30",
  venue: "Estadio Sánchez-Pizjuán · Sevilla",
  seating: "Mixed / home area",
  dressCode: "Navy, black, or gray. Skip red + white.",
};

// ---------------------------------------------------------------------------
// ScheduleContent
// ---------------------------------------------------------------------------

function ScheduleContent() {
  const searchParams = useSearchParams();
  const todayDay = getTripDayNumber();
  const queryDay = searchParams.get("day");
  const initialDay = queryDay ? Number(queryDay) : (todayDay ?? 1);
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);

  const now = useMinutelyTick();
  const day = tripDays.find((d) => d.dayNumber === selectedDay) ?? tripDays[0];
  const isToday = day.date === getSpainDateString();

  const partitioned = useMemo(() => {
    if (!isToday) {
      return partitionDay(day.events, "00:00");
    }
    return partitionDay(day.events, now);
  }, [day.events, isToday, now]);

  const pickerDays = useMemo(toPickerDays, []);
  const route = useMemo(
    () => getRouteForDay(day.dayNumber, day.events, partitioned.now),
    [day.dayNumber, day.events, partitioned.now]
  );

  const handleTap = (event: ScheduleEvent) => {
    // EventCard dispatches CustomEvent('open-event'). Hook for telemetry.
    void event;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.cream,
        fontFamily: "var(--font-lm-body)",
        color: colors.ink,
        paddingBottom: 96,
      }}
    >
      {/* Header */}
      <header style={{ padding: "24px 20px 12px" }}>
        <div
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: colors.red,
          }}
        >
          DAY {day.dayNumber} · {day.weekday.toUpperCase()}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 36,
            lineHeight: 1.05,
            margin: "6px 0 8px",
            color: colors.ink,
            letterSpacing: "-0.01em",
          }}
          data-testid="schedule-hero"
        >
          {day.title}
        </h1>
        <PosterStripe />
        <p
          style={{
            marginTop: 10,
            fontSize: 13,
            color: colors.gray,
          }}
        >
          {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          {" · "}
          {day.city}
        </p>
      </header>

      {/* Day picker */}
      <section
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: colors.cream,
          borderBottom: `1px solid ${colors.stroke}`,
        }}
      >
        <DayPicker
          days={pickerDays}
          selected={selectedDay}
          onSelect={setSelectedDay}
        />
      </section>

      {/* Multi-city route strip */}
      {route && (
        <section style={{ padding: "16px 20px 0" }}>
          <RouteIndicator
            cities={route}
            meta={metaForRoute(day.dayNumber, route.length)}
            label={`ROUTE · ${DAY_OF_WEEK_SHORT[day.weekday] ?? day.weekday.toUpperCase()}`}
          />
        </section>
      )}

      {/* Summary */}
      <section style={{ padding: "16px 20px 0" }}>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: colors.ink }}>
          {day.summary}
        </p>
      </section>

      {/* NOW card */}
      {partitioned.now && (
        <section style={{ padding: "16px 20px 0" }} data-testid="section-now">
          <EventCard event={partitioned.now} state="now" onTap={handleTap}>
            {renderAttendees(partitioned.now, "light")}
          </EventCard>
        </section>
      )}

      {/* NEXT card */}
      {partitioned.next && (
        <section style={{ padding: "16px 20px 0" }} data-testid="section-next">
          {renderNextHeader(partitioned.next, now, isToday)}
          {selectedDay === 2 && partitioned.next.type === "sport" ? (
            <MatchCard
              home={DAY_2_MATCH.home}
              away={DAY_2_MATCH.away}
              kickoff={DAY_2_MATCH.kickoff}
              venue={DAY_2_MATCH.venue}
              seating={DAY_2_MATCH.seating}
              dressCode={DAY_2_MATCH.dressCode}
              attendees={["charles", "tony"]}
            />
          ) : (
            <EventCard event={partitioned.next} state="next" onTap={handleTap}>
              {renderAttendees(partitioned.next, "dark")}
            </EventCard>
          )}
        </section>
      )}

      {/* Day 2: always surface the match card when it's not already "next" */}
      {selectedDay === 2 && partitioned.next?.type !== "sport" && (
        <section style={{ padding: "16px 20px 0" }} data-testid="section-match">
          <div
            style={{
              fontFamily: "var(--font-lm-display)",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: colors.gray,
              marginBottom: 8,
            }}
          >
            MATCH DAY
          </div>
          <MatchCard
            home={DAY_2_MATCH.home}
            away={DAY_2_MATCH.away}
            kickoff={DAY_2_MATCH.kickoff}
            venue={DAY_2_MATCH.venue}
            seating={DAY_2_MATCH.seating}
            dressCode={DAY_2_MATCH.dressCode}
            attendees={["charles", "tony"]}
          />
        </section>
      )}

      {/* LATER section */}
      {partitioned.later.length > 0 && (
        <section style={{ padding: "24px 20px 0" }} data-testid="section-later">
          <div
            style={{
              fontFamily: "var(--font-lm-display)",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: colors.gray,
              marginBottom: 8,
            }}
          >
            LATER
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {partitioned.later.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                state="future"
                variant="row"
                onTap={handleTap}
              />
            ))}
          </div>
        </section>
      )}

      {/* PAST / DONE */}
      {partitioned.past.length > 0 && isToday && (
        <section style={{ padding: "24px 20px 0" }} data-testid="section-past">
          <div
            style={{
              fontFamily: "var(--font-lm-display)",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: colors.gray,
              marginBottom: 8,
            }}
          >
            DONE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {partitioned.past.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                state="past"
                variant="row"
                onTap={handleTap}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function metaForRoute(dayNumber: number, legCount: number): string {
  if (dayNumber === 3) return `~270 km · ${legCount - 1} legs`;
  if (dayNumber === 5) return `~530 km · ${legCount - 1} legs`;
  if (dayNumber === 2) return `~530 km · ${legCount - 1} leg`;
  return `${legCount} stops`;
}

function renderNextHeader(
  nextEvent: ScheduleEvent,
  now: string,
  isToday: boolean
) {
  if (!isToday) return null;
  const delta = formatDelta(minutesUntil(nextEvent, now));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-lm-display)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: colors.gray,
        }}
      >
        UP NEXT
      </div>
      <div
        style={{
          fontSize: 11,
          color: colors.gray,
          letterSpacing: "0.04em",
        }}
      >
        {delta}
      </div>
    </div>
  );
}

function renderAttendees(
  event: ScheduleEvent,
  tone: "dark" | "light"
): React.ReactNode {
  if (event.splitGroup === "guys") {
    return <AttendeesRow persons={["charles", "tony"]} tone={tone} />;
  }
  if (event.splitGroup === "girls") {
    return <AttendeesRow persons={["ang", "carly"]} tone={tone} />;
  }
  return (
    <AttendeesRow
      persons={["ang", "carly", "charles", "tony"]}
      label="ALL 4 TOGETHER"
      tone={tone}
    />
  );
}
