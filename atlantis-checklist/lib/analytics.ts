import { getSupabase } from "./supabase";

// ─── User identification ───

const USER_ID_KEY = "atlantis-user-id";
const USER_NAME_KEY = "atlantis-user-name";
const EVENTS_KEY = "atlantis-analytics-events";

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
}

// Session ID — new per browser tab/reload
let sessionId: string | null = null;
function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID().slice(0, 8);
  }
  return sessionId;
}

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  const events = getStoredEvents();
  events.push(event);
  // Keep last 500 events locally
  const trimmed = events.slice(-500);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
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
  };

  // Store locally
  storeEvent(event);

  // Sync to Supabase if available
  const sb = getSupabase();
  if (sb) {
    sb.from("analytics_events")
      .insert(event)
      .then(() => {});
  }
}

// ─── Page view tracking ───

export function trackPageView(page: string) {
  trackEvent("page_view", { path: page });
}

// ─── Click tracking ───

export function trackClick(target: string, metadata?: Record<string, string | number | boolean>) {
  trackEvent("click", metadata, target);
}

// ─── Get all events (for analytics dashboard) ───

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
