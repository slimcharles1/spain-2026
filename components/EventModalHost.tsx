"use client";

// Mounts a single <EventDetailModal> at the root. Subscribes to the
// global 'open-event' CustomEvent bus via useEventModal and renders the
// modal when an event is active.

import { useEventModal } from "@/lib/useEventModal";
import EventDetailModal from "@/components/EventDetailModal";

export default function EventModalHost() {
  const { event, close } = useEventModal();
  return <EventDetailModal event={event} onClose={close} />;
}
