"use client";

// Global hook that subscribes to `window`'s 'open-event' CustomEvents and
// tracks the currently-open ScheduleEvent. Paired with <EventDetailModal>
// mounted once in the root layout so any `dispatchEvent(new CustomEvent(
// 'open-event', { detail: event }))` call opens the modal — this is the
// contract NEG-65 emits from schedule cards.

import { useCallback, useEffect, useState } from "react";
import type { ScheduleEvent } from "@/lib/schedule-data";

export const OPEN_EVENT_NAME = "open-event";

export interface UseEventModalResult {
  event: ScheduleEvent | null;
  close: () => void;
}

export function useEventModal(): UseEventModalResult {
  const [event, setEvent] = useState<ScheduleEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ScheduleEvent>;
      if (ce.detail) setEvent(ce.detail);
    };
    window.addEventListener(OPEN_EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(OPEN_EVENT_NAME, handler as EventListener);
  }, []);

  const close = useCallback(() => setEvent(null), []);

  return { event, close };
}
