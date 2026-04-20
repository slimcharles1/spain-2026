import { describe, expect, it } from "vitest";
import {
  buildRoute,
  formatDelta,
  getEventStates,
  minutesUntil,
  partitionDay,
  timeToMinutes,
} from "@/lib/schedule-state";
import type { ScheduleEvent } from "@/lib/schedule-data";

function makeEvent(
  id: string,
  time: string,
  durationMinutes = 60,
  overrides: Partial<ScheduleEvent> = {}
): ScheduleEvent {
  return {
    id,
    dayNumber: 1,
    date: "2026-05-16",
    time,
    title: id,
    description: "",
    type: "activity",
    durationMinutes,
    ...overrides,
  };
}

describe("timeToMinutes", () => {
  it("converts HH:MM to minutes", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("01:30")).toBe(90);
    expect(timeToMinutes("23:59")).toBe(23 * 60 + 59);
  });
});

describe("getEventStates", () => {
  const events = [
    makeEvent("breakfast", "09:00", 60),
    makeEvent("lunch", "13:00", 90),
    makeEvent("dinner", "20:00", 120),
  ];

  it("marks past events correctly", () => {
    const states = getEventStates(events, "14:30");
    expect(states.get("breakfast")).toBe("past");
    expect(states.get("lunch")).toBe("past");
    expect(states.get("dinner")).toBe("next");
  });

  it("marks the active event as now", () => {
    const states = getEventStates(events, "09:30");
    expect(states.get("breakfast")).toBe("now");
    expect(states.get("lunch")).toBe("next");
    expect(states.get("dinner")).toBe("future");
  });

  it("when no event is happening, first upcoming is next", () => {
    const states = getEventStates(events, "11:00");
    expect(states.get("breakfast")).toBe("past");
    expect(states.get("lunch")).toBe("next");
    expect(states.get("dinner")).toBe("future");
  });

  it("when all events are past, nothing is next", () => {
    const states = getEventStates(events, "23:30");
    expect(states.get("breakfast")).toBe("past");
    expect(states.get("lunch")).toBe("past");
    expect(states.get("dinner")).toBe("past");
  });

  it("before any event, first is next", () => {
    const states = getEventStates(events, "06:00");
    expect(states.get("breakfast")).toBe("next");
    expect(states.get("lunch")).toBe("future");
    expect(states.get("dinner")).toBe("future");
  });

  it("caps duration at next event's start", () => {
    const longBreakfast = [
      makeEvent("breakfast", "09:00", 180),
      makeEvent("lunch", "10:30", 60),
    ];
    const states = getEventStates(longBreakfast, "11:00");
    expect(states.get("breakfast")).toBe("past");
    expect(states.get("lunch")).toBe("now");
  });

  it("handles empty timeline", () => {
    expect(getEventStates([], "12:00").size).toBe(0);
  });

  it("keeps events stable when input is out of order", () => {
    const unordered = [
      makeEvent("dinner", "20:00", 60),
      makeEvent("breakfast", "09:00", 60),
      makeEvent("lunch", "13:00", 60),
    ];
    const states = getEventStates(unordered, "13:30");
    expect(states.get("breakfast")).toBe("past");
    expect(states.get("lunch")).toBe("now");
    expect(states.get("dinner")).toBe("next");
  });
});

describe("partitionDay", () => {
  const events = [
    makeEvent("a", "09:00", 60),
    makeEvent("b", "11:00", 60),
    makeEvent("c", "14:00", 60),
    makeEvent("d", "20:00", 60),
  ];

  it("returns now, next, later, past buckets", () => {
    const p = partitionDay(events, "11:30");
    expect(p.now?.id).toBe("b");
    expect(p.next?.id).toBe("c");
    expect(p.later.map((e) => e.id)).toEqual(["d"]);
    expect(p.past.map((e) => e.id)).toEqual(["a"]);
  });

  it("no now when between events", () => {
    const p = partitionDay(events, "12:30");
    expect(p.now).toBeNull();
    expect(p.next?.id).toBe("c");
    expect(p.past.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("start-of-day: no past, next is first", () => {
    const p = partitionDay(events, "06:00");
    expect(p.past).toHaveLength(0);
    expect(p.now).toBeNull();
    expect(p.next?.id).toBe("a");
    expect(p.later.map((e) => e.id)).toEqual(["b", "c", "d"]);
  });
});

describe("minutesUntil + formatDelta", () => {
  it("counts minutes until a future event", () => {
    const ev = makeEvent("later", "14:30");
    expect(minutesUntil(ev, "13:00")).toBe(90);
    expect(minutesUntil(ev, "14:30")).toBe(0);
    expect(minutesUntil(ev, "15:00")).toBe(-30);
  });

  it("formats common deltas", () => {
    expect(formatDelta(0)).toBe("now");
    expect(formatDelta(-5)).toBe("now");
    expect(formatDelta(20)).toBe("in 20 min");
    expect(formatDelta(60)).toBe("in 1h");
    expect(formatDelta(125)).toBe("in 2h 5m");
  });
});

describe("buildRoute", () => {
  it("tags past/now/sleep/future statuses", () => {
    const route = buildRoute(["Sevilla", "Jerez", "Cádiz", "Sevilla"], 2);
    expect(route.map((c) => c.status)).toEqual([
      "past",
      "past",
      "now",
      "sleep",
    ]);
  });

  it("explicit sleepIndex overrides default last-city", () => {
    const route = buildRoute(["Madrid", "Toledo", "Valdepeñas", "Madrid"], 1, 3);
    expect(route[3].status).toBe("sleep");
    expect(route[2].status).toBe("future");
  });

  it("first stop is now when nowIndex=0", () => {
    const route = buildRoute(["A", "B", "C"], 0);
    expect(route[0].status).toBe("now");
    expect(route[1].status).toBe("future");
    expect(route[2].status).toBe("sleep");
  });
});
