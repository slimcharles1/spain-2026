"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ScheduleEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  location: string;
  notes: string;
  type: "dining" | "activity" | "travel" | "pool" | "free";
  created_at: string;
}

const EVENT_TYPES = [
  { id: "dining" as const, emoji: "🍽️", label: "Dining", color: "coral" },
  { id: "activity" as const, emoji: "🎢", label: "Activity", color: "gold" },
  { id: "travel" as const, emoji: "✈️", label: "Travel", color: "pink" },
  { id: "pool" as const, emoji: "🏊", label: "Pool/Beach", color: "mint" },
  { id: "free" as const, emoji: "☀️", label: "Free Time", color: "white" },
];

const STORAGE_KEY = "atlantis-schedule";

// Generate trip days — adjust these dates to your actual trip
const TRIP_START = "2026-03-28";
const TRIP_END = "2026-04-04";

function generateDays(): string[] {
  const days: string[] = [];
  const start = new Date(TRIP_START + "T12:00:00");
  const end = new Date(TRIP_END + "T12:00:00");
  while (start <= end) {
    days.push(start.toISOString().split("T")[0]);
    start.setDate(start.getDate() + 1);
  }
  return days;
}

const TRIP_DAYS = generateDays();

function loadSchedule(): ScheduleEvent[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSchedule(events: ScheduleEvent[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }),
  };
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getTypeInfo(type: string) {
  return EVENT_TYPES.find((t) => t.id === type) ?? EVENT_TYPES[4];
}

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    if (TRIP_DAYS.includes(today)) return today;
    return TRIP_DAYS[0];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<ScheduleEvent["type"]>("activity");

  const dayScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEvents(loadSchedule());
  }, []);

  useEffect(() => {
    if (events.length > 0) saveSchedule(events);
  }, [events]);

  // Scroll to selected day pill on mount
  useEffect(() => {
    const idx = TRIP_DAYS.indexOf(selectedDay);
    if (dayScrollRef.current && idx >= 0) {
      const pill = dayScrollRef.current.children[idx] as HTMLElement;
      if (pill) {
        pill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDay]);

  const dayEvents = events
    .filter((e) => e.date === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const openAddForm = () => {
    setTitle("");
    setTime("12:00");
    setLocation("");
    setNotes("");
    setType("activity");
    setEditingEvent(null);
    setShowForm(true);
  };

  const openEditForm = (event: ScheduleEvent) => {
    setTitle(event.title);
    setTime(event.time);
    setLocation(event.location);
    setNotes(event.notes);
    setType(event.type);
    setEditingEvent(event);
    setShowForm(true);
  };

  const saveEvent = useCallback(() => {
    if (!title.trim()) return;

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? { ...e, title: title.trim(), time, location: location.trim(), notes: notes.trim(), type }
            : e
        )
      );
    } else {
      const newEvent: ScheduleEvent = {
        id: crypto.randomUUID(),
        date: selectedDay,
        time,
        title: title.trim(),
        location: location.trim(),
        notes: notes.trim(),
        type,
        created_at: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, newEvent]);
    }

    setShowForm(false);
    setEditingEvent(null);
  }, [title, time, location, notes, type, selectedDay, editingEvent]);

  const deleteEvent = useCallback(
    (id: string) => {
      setEvents((prev) => {
        const next = prev.filter((e) => e.id !== id);
        saveSchedule(next);
        return next;
      });
      setShowForm(false);
      setEditingEvent(null);
    },
    []
  );

  const borderColorMap: Record<string, string> = {
    coral: "border-l-coral",
    gold: "border-l-gold",
    pink: "border-l-pink",
    mint: "border-l-mint",
    white: "border-l-white/30",
  };

  return (
    <div className="min-h-screen font-body">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-ocean-950 to-ocean-900 pb-4 shadow-lg shadow-ocean-950/50">
        <div className="px-5 pt-10 pb-2 text-center">
          <h1 className="font-display text-3xl bg-gradient-to-r from-gold via-coral to-pink bg-clip-text text-transparent">
            Schedule
          </h1>
          <p className="text-white/50 text-sm mt-1 tracking-wide">
            The Reef at Atlantis
          </p>
        </div>

        {/* Day selector */}
        <div
          ref={dayScrollRef}
          className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {TRIP_DAYS.map((day) => {
            const { weekday, day: d, month } = formatDay(day);
            const active = day === selectedDay;
            const eventCount = events.filter((e) => e.date === day).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 flex flex-col items-center py-2 px-3 rounded-xl min-w-[56px] transition-all ${
                  active
                    ? "bg-white/15 text-white ring-1 ring-mint/40"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                <span className="text-[10px] font-medium uppercase">{weekday}</span>
                <span className="text-lg font-bold leading-tight">{d}</span>
                <span className="text-[10px]">{month}</span>
                {eventCount > 0 && (
                  <div className="w-1.5 h-1.5 bg-mint rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 py-4 space-y-2">
        {dayEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-white/30 text-sm">No plans yet</p>
            <p className="text-white/20 text-xs mt-1">
              Tap + to add something
            </p>
          </div>
        )}

        {dayEvents.map((event) => {
          const typeInfo = getTypeInfo(event.type);
          return (
            <button
              key={event.id}
              onClick={() => openEditForm(event)}
              className={`w-full flex items-start gap-3 bg-ocean-800/60 rounded-2xl p-3.5 border border-white/5 border-l-[3px] ${
                borderColorMap[typeInfo.color] ?? "border-l-white/30"
              } text-left hover:bg-ocean-800/80 transition-colors`}
            >
              <div className="text-white/50 text-xs font-mono pt-0.5 w-16 flex-shrink-0">
                {formatTime(event.time)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{typeInfo.emoji}</span>
                  <span className="text-white text-sm font-medium truncate">
                    {event.title}
                  </span>
                </div>
                {event.location && (
                  <div className="text-white/40 text-xs mt-0.5 truncate">
                    📍 {event.location}
                  </div>
                )}
                {event.notes && (
                  <div className="text-white/30 text-xs mt-1 line-clamp-2">
                    {event.notes}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* FAB */}
      <button
        onClick={openAddForm}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-gradient-to-br from-coral to-pink rounded-full flex items-center justify-center shadow-lg shadow-coral/30 hover:scale-105 active:scale-95 transition-transform"
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add/Edit event form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-ocean-900 rounded-t-3xl w-full max-w-lg border-t border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-white font-display text-xl">
                  {editingEvent ? "Edit Event" : "Add Event"}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="text-white/40 hover:text-white/70 p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">What</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Dinner at Nobu, Aquaventure, etc."
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50"
                />
              </div>

              {/* Time */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 outline-none focus:ring-1 focus:ring-mint/50 [color-scheme:dark]"
                />
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                        type === t.id
                          ? "bg-white/15 text-white ring-1 ring-mint/40"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Where (optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Restaurant name, pool area, etc."
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Confirmation #, dress code, etc."
                  rows={2}
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {editingEvent && (
                  <button
                    onClick={() => deleteEvent(editingEvent.id)}
                    className="py-3.5 px-5 rounded-xl bg-coral/10 text-coral font-semibold text-sm hover:bg-coral/20 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={saveEvent}
                  disabled={!title.trim()}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-coral to-pink text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {editingEvent ? "Save Changes" : "Add Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
