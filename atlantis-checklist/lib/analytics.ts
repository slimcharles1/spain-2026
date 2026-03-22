import { getSupabase } from "./supabase";

// ─── User identification ───

const USER_ID_KEY = "atlantis-user-id";
const USER_NAME_KEY = "atlantis-user-name";
const EVENTS_KEY = "atlantis-analytics-events";
const IP_KEY = "atlantis-user-ip";

export function getUserId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_NAME_KEY);
}

export function setUserName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_NAME_KEY, name);
  trackEvent("user_identified", { name });
}

// ─── IP + Device ───

let cachedIp: string | null = null;

export async function fetchIp(): Promise<string> {
  if (cachedIp) return cachedIp;
  if (typeof window === "undefined") return "server";
  try {
    const stored = localStorage.getItem(IP_KEY);
    if (stored) { cachedIp = stored; return stored; }
    const res = await fetch("/api/ip");
    const data = await res.json();
    cachedIp = data.ip || "unknown";
    localStorage.setItem(IP_KEY, cachedIp!);
    return cachedIp!;
  } catch {
    return "unknown";
  }
}

export function getDeviceInfo(): string {
  if (typeof window === "undefined") return "server";
  return navigator.userAgent;
}

// ─── Event tracking ───

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  user_name: string | null;
  event_type: string;
  page: string;
  target: string | null;
  metadata: Record<string, string | number | boolean> | null;
  timestamp: string;
  session_id: string;
  ip_address: string | null;
  device_info: string | null;
}

let sessionId: string | null = null;
function getSessionId(): string {
  if (!sessionId) sessionId = crypto.randomUUID().slice(0, 8);
  return sessionId;
}

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
  } catch { return []; }
}

function storeEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  const events = getStoredEvents();
  events.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-500)));
}

export function trackEvent(
  eventType: string,
  metadata?: Record<string, string | number | boolean>,
  target?: string
) {
  if (typeof window === "undefined") return;

  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    user_id: getUserId(),
    user_name: getUserName(),
    event_type: eventType,
    page: window.location.pathname,
    target: target ?? null,
    metadata: metadata ?? null,
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    ip_address: cachedIp,
    device_info: getDeviceInfo(),
  };

  storeEvent(event);

  const sb = getSupabase();
  if (sb) {
    // If we don't have IP yet, fetch it and update
    if (!cachedIp) {
      fetchIp().then((ip) => {
        sb.from("analytics_events").insert({ ...event, ip_address: ip }).then(() => {});
      });
    } else {
      sb.from("analytics_events").insert(event).then(() => {});
    }
  }
}

// ─── Convenience ───

export function trackPageView(page: string) {
  trackEvent("page_view", { path: page });
}

export function trackClick(target: string, metadata?: Record<string, string | number | boolean>) {
  trackEvent("click", metadata, target);
}

// ─── Data access ───

export function getAllEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

export function getEventsByUser(): Record<string, AnalyticsEvent[]> {
  const events = getStoredEvents();
  const byUser: Record<string, AnalyticsEvent[]> = {};
  for (const e of events) {
    const key = e.user_name || e.user_id.slice(0, 8);
    if (!byUser[key]) byUser[key] = [];
    byUser[key].push(e);
  }
  return byUser;
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EVENTS_KEY);
}

// ─── CSV export ───

export function eventsToCSV(events: AnalyticsEvent[]): string {
  const headers = ["timestamp", "user_name", "user_id", "session_id", "event_type", "page", "target", "ip_address", "device_info", "metadata"];
  const rows = events.map((e) => [
    e.timestamp,
    e.user_name || "",
    e.user_id,
    e.session_id,
    e.event_type,
    e.page,
    e.target || "",
    e.ip_address || "",
    (e.device_info || "").replace(/,/g, ";"),
    e.metadata ? JSON.stringify(e.metadata) : "",
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return [headers.join(","), ...rows].join("\n");
}
