"use client";

import { useState, useEffect, useCallback } from "react";
import { tripDays, type ScheduleEvent } from "./schedule-data";

const SPAIN_TZ = "Europe/Madrid";

// Get current time in Spain as a Date-like object
export function getSpainNow(): Date {
  // Create a date string in Spain timezone, then parse back
  const now = new Date();
  const spainStr = now.toLocaleString("en-US", { timeZone: SPAIN_TZ });
  return new Date(spainStr);
}

// Get today's date string in Spain (YYYY-MM-DD)
export function getSpainDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SPAIN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Get Spain time formatted as HH:MM (24h)
export function getSpainTimeString(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SPAIN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

// Day boundary is 4 AM — events after midnight belong to previous day
export function getTripDayNumber(): number | null {
  const spainNow = getSpainNow();
  const hour = spainNow.getHours();
  const dateStr = getSpainDateString();

  // If before 4 AM, this belongs to the previous calendar day's trip day
  if (hour < 4) {
    const yesterday = new Date(spainNow);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: SPAIN_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(yesterday);
    const day = tripDays.find((d) => d.date === yesterdayStr);
    return day?.dayNumber ?? null;
  }

  const day = tripDays.find((d) => d.date === dateStr);
  return day?.dayNumber ?? null;
}

// Get current city based on trip day
export function getCurrentCity(): string | null {
  const dayNum = getTripDayNumber();
  if (!dayNum) return null;
  const day = tripDays.find((d) => d.dayNumber === dayNum);
  return day?.city ?? null;
}

// Get current hotel based on trip day
export function getCurrentHotel(): {
  name: string;
  address: string;
  mapsQuery: string;
} | null {
  const dayNum = getTripDayNumber();
  if (!dayNum) return null;

  // Day 1 (May 16): URSO Hotel
  if (dayNum === 1) {
    return {
      name: "URSO Hotel & Spa",
      address: "Calle de Mejía Lequerica, 8, Madrid",
      mapsQuery: "URSO Hotel Spa Madrid",
    };
  }
  // Days 2-4 (May 17-19): Hotel Colón Gran Meliá
  if (dayNum >= 2 && dayNum <= 4) {
    return {
      name: "Hotel Colón Gran Meliá",
      address: "Canalejas, 1, Seville",
      mapsQuery: "Hotel Colon Gran Melia Seville",
    };
  }
  // Days 5-7 (May 20-22): Gran Hotel Inglés
  if (dayNum >= 5 && dayNum <= 7) {
    return {
      name: "Gran Hotel Inglés",
      address: "Calle de Echegaray, 8, Madrid",
      mapsQuery: "Gran Hotel Ingles Madrid",
    };
  }
  return null;
}

// Parse a time string "HH:MM" into minutes since midnight
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Determine event state
export type EventState = "past" | "now" | "next" | "future";

export function getEventStates(
  events: ScheduleEvent[],
  currentTimeStr: string
): Map<string, EventState> {
  const states = new Map<string, EventState>();
  const nowMinutes = timeToMinutes(currentTimeStr);

  let foundNow = false;
  let foundNext = false;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const startMinutes = timeToMinutes(event.time);
    const duration = event.durationMinutes ?? 90;
    const endMinutes = Math.min(
      startMinutes + duration,
      i + 1 < events.length ? timeToMinutes(events[i + 1].time) : startMinutes + duration
    );

    if (nowMinutes >= startMinutes && nowMinutes < endMinutes && !foundNow) {
      states.set(event.id, "now");
      foundNow = true;
    } else if (nowMinutes < startMinutes && !foundNext) {
      if (foundNow || !foundNext) {
        states.set(event.id, "next");
        foundNext = true;
      }
    } else if (nowMinutes >= endMinutes) {
      states.set(event.id, "past");
    } else {
      states.set(event.id, "future");
    }
  }

  // If we never found "now" and never found "next", first future event is "next"
  if (!foundNow && !foundNext) {
    for (const event of events) {
      if (!states.has(event.id) || states.get(event.id) === "future") {
        const startMinutes = timeToMinutes(event.time);
        if (nowMinutes < startMinutes) {
          states.set(event.id, "next");
          break;
        }
      }
    }
  }

  // Fill remaining as future
  for (const event of events) {
    if (!states.has(event.id)) {
      states.set(event.id, "future");
    }
  }

  return states;
}

// Hook: returns current Spain time string, refreshing every 60s
export function useSpainTime(): string {
  const [time, setTime] = useState(getSpainTimeString);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getSpainTimeString());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

// Trip phase
export type TripPhase = "pre" | "during" | "post";

export function getTripPhase(): TripPhase {
  const dateStr = getSpainDateString();
  const tripStart = "2026-05-16"; // First day in Spain (fly out May 15 evening)
  const tripEnd = "2026-05-22"; // Fly home day

  if (dateStr < tripStart) return "pre";
  if (dateStr > tripEnd) return "post";
  return "during";
}

// Days until trip
export function daysUntilTrip(): number {
  const now = new Date();
  const tripStart = new Date("2026-05-15T00:00:00");
  const diff = tripStart.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Format minutes delta as human string
export function formatTimeDelta(minutes: number): string {
  if (minutes < 1) return "now";
  if (minutes < 60) return `in ${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `in ${hrs}h`;
  return `in ${hrs}h ${mins}m`;
}

// Get "happening now" and "up next" events for a given day
export function getNowAndNext(dayNumber: number): {
  now: ScheduleEvent | null;
  next: ScheduleEvent | null;
  minutesUntilNext: number | null;
  minutesIntoNow: number | null;
  nowDurationMinutes: number | null;
} {
  const day = tripDays.find((d) => d.dayNumber === dayNumber);
  if (!day) return { now: null, next: null, minutesUntilNext: null, minutesIntoNow: null, nowDurationMinutes: null };

  const currentTime = getSpainTimeString();
  const states = getEventStates(day.events, currentTime);
  const nowMinutes = timeToMinutes(currentTime);

  let nowEvent: ScheduleEvent | null = null;
  let nextEvent: ScheduleEvent | null = null;

  for (const event of day.events) {
    const state = states.get(event.id);
    if (state === "now") nowEvent = event;
    if (state === "next") nextEvent = event;
  }

  const minutesUntilNext = nextEvent
    ? timeToMinutes(nextEvent.time) - nowMinutes
    : null;

  const minutesIntoNow = nowEvent
    ? nowMinutes - timeToMinutes(nowEvent.time)
    : null;

  const nowDurationMinutes = nowEvent
    ? (nowEvent.durationMinutes ?? 90)
    : null;

  return { now: nowEvent, next: nextEvent, minutesUntilNext, minutesIntoNow, nowDurationMinutes };
}
