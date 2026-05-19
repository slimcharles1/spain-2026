import type { ScheduleEvent } from "./schedule-data";

const EARTH_RADIUS_KM = 6371;
const STREET_FACTOR = 1.3;
const WALKING_KMH = 5;
const MAX_WALKABLE_KM = 10;

interface Coords {
  lat: number;
  lng: number;
}

function hasCoords(event: ScheduleEvent): boolean {
  return event.location?.lat != null && event.location?.lng != null;
}

function getCoords(event: ScheduleEvent): Coords | null {
  if (!hasCoords(event)) return null;
  return { lat: event.location!.lat!, lng: event.location!.lng! };
}

function haversineKm(a: Coords, b: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function walkingMinutes(a: Coords, b: Coords): number {
  const straightKm = haversineKm(a, b);
  const streetKm = straightKm * STREET_FACTOR;
  return Math.round((streetKm / WALKING_KMH) * 60);
}

export interface WalkContext {
  minutes: number;
  fromName: string;
}

/**
 * Compute walking time from the previous walkable event in the same day.
 * Returns null when either side has no coords, either is type=travel
 * (you arrived/leave by car), or the distance is too far to walk (>10km).
 */
export function walkFromPrevious(
  event: ScheduleEvent,
  dayEvents: ScheduleEvent[]
): WalkContext | null {
  const index = dayEvents.findIndex((e) => e.id === event.id);
  if (index <= 0) return null;
  if (event.type === "travel") return null;

  const prev = dayEvents[index - 1];
  if (prev.type === "travel") return null;

  const a = getCoords(prev);
  const b = getCoords(event);
  if (!a || !b) return null;

  const km = haversineKm(a, b) * STREET_FACTOR;
  if (km > MAX_WALKABLE_KM) return null;
  if (km < 0.05) return null;

  return {
    minutes: walkingMinutes(a, b),
    fromName: prev.location?.name ?? prev.title,
  };
}
