/**
 * schedule-state — NOW / NEXT / LATER derivation for the schedule screens.
 *
 * The TimelineEvent/EventCard states drive the tiered surfaces from the NEG-64
 * design system (cream = past/future, cobalt = now, yellow = next).
 *
 * Time math is anchored to Europe/Madrid. Callers pass in a "HH:MM" wall-clock
 * string so the function stays pure and easy to unit-test.
 */

import type { ScheduleEvent } from "./schedule-data";

export type EventState = "past" | "now" | "next" | "future";

export interface PartitionedEvents {
  now: ScheduleEvent | null;
  next: ScheduleEvent | null;
  later: ScheduleEvent[];
  past: ScheduleEvent[];
  states: Map<string, EventState>;
}

// Parse "HH:MM" -> minutes since midnight
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Compute the state for every event in an ordered day timeline.
 *
 * Rules:
 *  - past: event ended before `now`
 *  - now: `now` falls inside [start, end) for the event (end defaults to next
 *    event's start, capped at start + durationMinutes)
 *  - next: first event whose start > `now` and no current `now` ended yet
 *  - future: all remaining upcoming events
 *
 * When no event is currently happening, the first upcoming one is `next`.
 * When every event is past, there is no `next`.
 */
export function getEventStates(
  events: ScheduleEvent[],
  nowStr: string
): Map<string, EventState> {
  const states = new Map<string, EventState>();
  if (events.length === 0) return states;

  const nowMinutes = timeToMinutes(nowStr);
  // Assume timeline is sorted by time; make a stable copy just in case.
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  let foundNow = false;
  let foundNext = false;

  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i];
    const start = timeToMinutes(event.time);
    const duration = event.durationMinutes ?? 90;
    const nextStart =
      i + 1 < sorted.length ? timeToMinutes(sorted[i + 1].time) : Infinity;
    const end = Math.min(start + duration, nextStart);

    if (nowMinutes >= start && nowMinutes < end && !foundNow) {
      states.set(event.id, "now");
      foundNow = true;
    } else if (nowMinutes < start) {
      if (!foundNext) {
        states.set(event.id, "next");
        foundNext = true;
      } else {
        states.set(event.id, "future");
      }
    } else {
      // nowMinutes >= end
      states.set(event.id, "past");
    }
  }

  return states;
}

/**
 * Partition events into the groups the schedule page renders:
 *  - now: the (single) current event
 *  - next: the first upcoming event
 *  - later: all remaining upcoming events (after `next`)
 *  - past: everything that's ended
 */
export function partitionDay(
  events: ScheduleEvent[],
  nowStr: string
): PartitionedEvents {
  const states = getEventStates(events, nowStr);
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  let now: ScheduleEvent | null = null;
  let next: ScheduleEvent | null = null;
  const later: ScheduleEvent[] = [];
  const past: ScheduleEvent[] = [];

  for (const event of sorted) {
    const state = states.get(event.id);
    if (state === "now") now = event;
    else if (state === "next") next = event;
    else if (state === "past") past.push(event);
    else if (state === "future") later.push(event);
  }

  return { now, next, later, past, states };
}

/**
 * Minutes until a future event's start (negative if past, 0 if now).
 */
export function minutesUntil(event: ScheduleEvent, nowStr: string): number {
  return timeToMinutes(event.time) - timeToMinutes(nowStr);
}

/**
 * Human-friendly delta string for NEXT card copy ("in 20 min", "in 2h 10m").
 */
export function formatDelta(minutes: number): string {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `in ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}

/**
 * Build the ordered city sequence for multi-city days (Day 3, Day 5).
 * `status` is derived relative to the current event for visual states:
 *  - past: the group departed the city before `now`
 *  - now: the group is currently in this city
 *  - sleep: the city where the group will spend the night (last city)
 *  - future: upcoming stops
 */
export type CityStatus = "past" | "now" | "future" | "sleep";
export interface CityStop {
  name: string;
  status: CityStatus;
}

/**
 * Derive an ordered list of city stops from an event timeline.
 * Cities are pulled from `event.location.name`-derived city tokens or an
 * explicit `cities` prop. This helper takes the explicit city sequence and a
 * "now index" (0-based) and tags each stop.
 */
export function buildRoute(
  cities: string[],
  nowIndex: number,
  sleepIndex?: number
): CityStop[] {
  const finalSleep = sleepIndex ?? cities.length - 1;
  return cities.map((name, i) => {
    let status: CityStatus;
    if (i < nowIndex) status = "past";
    else if (i === nowIndex) status = "now";
    else if (i === finalSleep) status = "sleep";
    else status = "future";
    return { name, status };
  });
}
