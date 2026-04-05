import { describe, it, expect } from "vitest";
import { formatTimeDelta, getEventStates } from "@/lib/time-utils";
import type { ScheduleEvent } from "@/lib/schedule-data";

describe("formatTimeDelta", () => {
  it("returns 'now' for less than 1 minute", () => {
    expect(formatTimeDelta(0)).toBe("now");
    expect(formatTimeDelta(0.5)).toBe("now");
  });

  it("returns minutes for < 60", () => {
    expect(formatTimeDelta(15)).toBe("in 15 min");
    expect(formatTimeDelta(45)).toBe("in 45 min");
  });

  it("returns hours only when even", () => {
    expect(formatTimeDelta(120)).toBe("in 2h");
    expect(formatTimeDelta(60)).toBe("in 1h");
  });

  it("returns hours and minutes", () => {
    expect(formatTimeDelta(90)).toBe("in 1h 30m");
    expect(formatTimeDelta(135)).toBe("in 2h 15m");
  });
});

describe("getEventStates", () => {
  const makeEvent = (id: string, time: string, duration = 60): ScheduleEvent => ({
    id,
    dayNumber: 1,
    date: "2026-05-16",
    time,
    title: id,
    description: "",
    type: "activity",
    durationMinutes: duration,
  });

  it("marks earlier events as past", () => {
    const events = [makeEvent("breakfast", "09:00"), makeEvent("lunch", "13:00")];
    const states = getEventStates(events, "14:30");
    expect(states.get("breakfast")).toBe("past");
  });

  it("marks current event as now", () => {
    const events = [makeEvent("breakfast", "09:00"), makeEvent("lunch", "13:00")];
    const states = getEventStates(events, "09:30");
    expect(states.get("breakfast")).toBe("now");
  });

  it("marks the event after now as next", () => {
    const events = [makeEvent("breakfast", "09:00"), makeEvent("lunch", "13:00"), makeEvent("dinner", "20:00")];
    const states = getEventStates(events, "09:30");
    expect(states.get("lunch")).toBe("next");
  });

  it("marks far-future events as future", () => {
    const events = [makeEvent("breakfast", "09:00"), makeEvent("lunch", "13:00"), makeEvent("dinner", "20:00")];
    const states = getEventStates(events, "09:30");
    expect(states.get("dinner")).toBe("future");
  });

  it("handles all events being in the past", () => {
    const events = [makeEvent("breakfast", "09:00", 30), makeEvent("lunch", "13:00", 60)];
    const states = getEventStates(events, "23:00");
    expect(states.get("breakfast")).toBe("past");
    expect(states.get("lunch")).toBe("past");
  });

  it("handles all events being in the future", () => {
    const events = [makeEvent("breakfast", "09:00"), makeEvent("lunch", "13:00")];
    const states = getEventStates(events, "06:00");
    expect(states.get("breakfast")).toBe("next");
    expect(states.get("lunch")).toBe("future");
  });

  it("clamps now event to next event start time", () => {
    // breakfast 09:00 with 120min duration, but lunch starts at 10:00
    // at 10:30, breakfast should be past (clamped by lunch start)
    const events = [makeEvent("breakfast", "09:00", 120), makeEvent("lunch", "10:00", 60)];
    const states = getEventStates(events, "10:30");
    expect(states.get("breakfast")).toBe("past");
    expect(states.get("lunch")).toBe("now");
  });
});
