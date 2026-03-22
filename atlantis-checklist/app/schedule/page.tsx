"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { getSupabase } from "@/lib/supabase";

interface ScheduleEvent {
  id: string;
  date: string;
  time: string;
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

function loadLocal(): ScheduleEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveLocal(e: ScheduleEvent[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return { weekday: d.toLocaleDateString("en-US", { weekday: "short" }), day: d.getDate(), month: d.toLocaleDateString("en-US", { month: "short" }) };
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function getTypeInfo(type: string) {
  return EVENT_TYPES.find((t) => t.id === type) ?? EVENT_TYPES[4];
}

// Simple parser — extracts date, time, title, location from pasted text
function parseReservationText(text: string): Partial<ScheduleEvent>[] {
  const results: Partial<ScheduleEvent>[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Try to find date patterns
  const dateRegex = /(\w+ \d{1,2},?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/gi;
  const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi;

  let foundDate = "";
  let foundTime = "";
  let foundTitle = "";
  let foundLocation = "";
  let foundNotes = "";

  for (const line of lines) {
    const datMatch = line.match(dateRegex);
    if (datMatch) {
      const parsed = new Date(datMatch[0]);
      if (!isNaN(parsed.getTime())) {
        foundDate = parsed.toISOString().split("T")[0];
      }
    }
    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      const t = timeMatch[0].trim();
      const isPM = /pm/i.test(t);
      const isAM = /am/i.test(t);
      const parts = t.replace(/\s*(am|pm)/i, "").split(":");
      let hr = parseInt(parts[0]);
      const min = parts[1] || "00";
      if (isPM && hr < 12) hr += 12;
      if (isAM && hr === 12) hr = 0;
      foundTime = `${hr.toString().padStart(2, "0")}:${min.padStart(2, "0")}`;
    }
    // Look for restaurant/location keywords
    if (/restaurant|resort|hotel|beach|pool|airport|terminal|gate/i.test(line)) {
      foundLocation = foundLocation || line.substring(0, 80);
    }
    // Look for confirmation numbers
    if (/confirm|reservation|booking|ref/i.test(line)) {
      foundNotes = foundNotes || line.substring(0, 120);
    }
  }

  // Use first meaningful line as title if we don't have one
  foundTitle = lines.find((l) => l.length > 5 && l.length < 80 && !/confirm|http|@/i.test(l)) || lines[0] || "Imported reservation";

  // Guess the type
  let guessedType: ScheduleEvent["type"] = "activity";
  const lowerText = text.toLowerCase();
  if (/dinner|lunch|breakfast|restaurant|reservation|nobu|seafire|pizzeria|bbq|deli/i.test(lowerText)) guessedType = "dining";
  else if (/flight|airport|airline|boarding|terminal|gate|uber|taxi|transfer/i.test(lowerText)) guessedType = "travel";
  else if (/pool|beach|swim|aquaventure|splashers|waterpark/i.test(lowerText)) guessedType = "pool";

  if (foundDate || foundTime || foundTitle) {
    results.push({
      date: foundDate || TRIP_DAYS[0],
      time: foundTime || "12:00",
      title: foundTitle,
      location: foundLocation,
      notes: foundNotes || text.substring(0, 200),
      type: guessedType,
    });
  }

  return results;
}

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return TRIP_DAYS.includes(today) ? today : TRIP_DAYS[0];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<Partial<ScheduleEvent>[]>([]);
  const [useDb, setUseDb] = useState(false);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<ScheduleEvent["type"]>("activity");
  const dayScrollRef = useRef<HTMLDivElement>(null);

  // Initialize — Supabase or localStorage
  useEffect(() => {
    const sb = getSupabase();
    if (sb) {
      setUseDb(true);
      sb.from("schedule_events").select("*").order("date").order("time").then(({ data }) => {
        if (data) setEvents(data as ScheduleEvent[]);
      });
      const channel = sb.channel("schedule-realtime").on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedule_events" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const n = payload.new as ScheduleEvent;
            setEvents((prev) => prev.some((e) => e.id === n.id) ? prev : [...prev, n]);
          } else if (payload.eventType === "UPDATE") {
            const u = payload.new as ScheduleEvent;
            setEvents((prev) => prev.map((e) => e.id === u.id ? { ...e, ...u } : e));
          } else if (payload.eventType === "DELETE") {
            const d = payload.old as { id: string };
            setEvents((prev) => prev.filter((e) => e.id !== d.id));
          }
        }
      ).subscribe();
      return () => { sb.removeChannel(channel); };
    } else {
      setEvents(loadLocal());
    }
  }, []);

  useEffect(() => {
    if (!useDb && events.length > 0) saveLocal(events);
  }, [events, useDb]);

  useEffect(() => {
    const idx = TRIP_DAYS.indexOf(selectedDay);
    if (dayScrollRef.current && idx >= 0) {
      const pill = dayScrollRef.current.children[idx] as HTMLElement;
      pill?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedDay]);

  const dayEvents = events.filter((e) => e.date === selectedDay).sort((a, b) => a.time.localeCompare(b.time));

  const openAddForm = () => {
    setTitle(""); setTime("12:00"); setLocation(""); setNotes(""); setType("activity");
    setEditingEvent(null); setShowForm(true);
  };

  const openEditForm = (event: ScheduleEvent) => {
    setTitle(event.title); setTime(event.time); setLocation(event.location);
    setNotes(event.notes); setType(event.type); setEditingEvent(event); setShowForm(true);
  };

  const saveEvent = useCallback(() => {
    if (!title.trim()) return;
    const sb = getSupabase();

    if (editingEvent) {
      const updated = { ...editingEvent, title: title.trim(), time, location: location.trim(), notes: notes.trim(), type };
      setEvents((prev) => prev.map((e) => e.id === editingEvent.id ? updated : e));
      if (sb) { sb.from("schedule_events").update({ title: updated.title, time, location: updated.location, notes: updated.notes, type }).eq("id", editingEvent.id).then(() => {}); }
    } else {
      const newEvent: ScheduleEvent = {
        id: crypto.randomUUID(), date: selectedDay, time, title: title.trim(),
        location: location.trim(), notes: notes.trim(), type, created_at: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, newEvent]);
      trackEvent("schedule_event_added", { title: title.trim(), type, date: selectedDay });
      if (sb) { sb.from("schedule_events").insert(newEvent).then(() => {}); }
    }
    setShowForm(false); setEditingEvent(null);
  }, [title, time, location, notes, type, selectedDay, editingEvent]);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (!useDb) saveLocal(next);
      return next;
    });
    setShowForm(false); setEditingEvent(null);
    const sb = getSupabase();
    if (sb) { sb.from("schedule_events").delete().eq("id", id).then(() => {}); }
  }, [useDb]);

  // Import flow
  const handleImportTextChange = (text: string) => {
    setImportText(text);
    if (text.trim().length > 10) {
      setImportPreview(parseReservationText(text));
    } else {
      setImportPreview([]);
    }
  };

  const confirmImport = () => {
    const sb = getSupabase();
    for (const preview of importPreview) {
      const newEvent: ScheduleEvent = {
        id: crypto.randomUUID(),
        date: preview.date || selectedDay,
        time: preview.time || "12:00",
        title: preview.title || "Imported reservation",
        location: preview.location || "",
        notes: preview.notes || "",
        type: preview.type || "activity",
        created_at: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, newEvent]);
      trackEvent("schedule_import", { title: newEvent.title });
      if (sb) { sb.from("schedule_events").insert(newEvent).then(() => {}); }
    }
    setShowImport(false); setImportText(""); setImportPreview([]);
  };

  const borderColorMap: Record<string, string> = {
    coral: "border-l-coral", gold: "border-l-gold", pink: "border-l-pink",
    mint: "border-l-mint", white: "border-l-white/30",
  };

  return (
    <div className="min-h-screen font-body">
      <div className="sticky top-0 z-40 bg-gradient-to-b from-ocean-950 to-ocean-900 pb-4 shadow-lg shadow-ocean-950/50">
        <div className="px-5 pt-10 pb-2 text-center">
          <h1 className="font-display text-3xl bg-gradient-to-r from-gold via-coral to-pink bg-clip-text text-transparent">
            Schedule
          </h1>
          <p className="text-white/50 text-sm mt-1 tracking-wide">
            The Reef at Atlantis {useDb && <span className="text-mint/50">· synced</span>}
          </p>
        </div>

        <div ref={dayScrollRef} className="flex gap-2 px-4 mt-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TRIP_DAYS.map((day) => {
            const { weekday, day: d, month } = formatDay(day);
            const active = day === selectedDay;
            const eventCount = events.filter((e) => e.date === day).length;
            return (
              <button key={day} onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 flex flex-col items-center py-2 px-3 rounded-xl min-w-[56px] transition-all ${
                  active ? "bg-white/15 text-white ring-1 ring-mint/40" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                <span className="text-[10px] font-medium uppercase">{weekday}</span>
                <span className="text-lg font-bold leading-tight">{d}</span>
                <span className="text-[10px]">{month}</span>
                {eventCount > 0 && <div className="w-1.5 h-1.5 bg-mint rounded-full mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {dayEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-white/30 text-sm">No plans yet</p>
            <p className="text-white/20 text-xs mt-1">Tap + to add or paste a reservation</p>
          </div>
        )}
        {dayEvents.map((event) => {
          const typeInfo = getTypeInfo(event.type);
          return (
            <button key={event.id} onClick={() => openEditForm(event)}
              className={`w-full flex items-start gap-3 bg-ocean-800/60 rounded-2xl p-3.5 border border-white/5 border-l-[3px] ${
                borderColorMap[typeInfo.color] ?? "border-l-white/30"} text-left hover:bg-ocean-800/80 transition-colors`}>
              <div className="text-white/50 text-xs font-mono pt-0.5 w-16 flex-shrink-0">{formatTime(event.time)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{typeInfo.emoji}</span>
                  <span className="text-white text-sm font-medium truncate">{event.title}</span>
                </div>
                {event.location && <div className="text-white/40 text-xs mt-0.5 truncate">📍 {event.location}</div>}
                {event.notes && <div className="text-white/30 text-xs mt-1 line-clamp-2">{event.notes}</div>}
              </div>
            </button>
          );
        })}
      </div>

      {/* FABs — Add + Import */}
      <div className="fixed bottom-24 right-5 z-40 flex flex-col gap-3">
        <button onClick={() => setShowImport(true)}
          className="w-14 h-14 bg-gradient-to-br from-gold to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-gold/30 hover:scale-105 active:scale-95 transition-transform"
          title="Paste reservation">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button onClick={openAddForm}
          className="w-14 h-14 bg-gradient-to-br from-coral to-pink rounded-full flex items-center justify-center shadow-lg shadow-coral/30 hover:scale-105 active:scale-95 transition-transform">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-ocean-900 rounded-t-3xl w-full max-w-lg border-t border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-display text-xl">Import Reservation</h3>
                <button onClick={() => { setShowImport(false); setImportText(""); setImportPreview([]); }}
                  className="text-white/40 hover:text-white/70 p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/40 text-xs mb-3">
                Paste a confirmation email, booking details, or any text with reservation info. We&apos;ll extract the date, time, and details.
              </p>
              <textarea
                value={importText}
                onChange={(e) => handleImportTextChange(e.target.value)}
                placeholder="Paste your reservation confirmation here..."
                rows={6}
                autoFocus
                className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50 resize-none mb-4"
              />

              {importPreview.length > 0 && (
                <div className="mb-4">
                  <p className="text-white/50 text-xs font-medium mb-2">Preview — we found:</p>
                  {importPreview.map((p, i) => (
                    <div key={i} className="bg-ocean-800/80 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{getTypeInfo(p.type || "activity").emoji}</span>
                        <span className="text-white font-medium">{p.title}</span>
                      </div>
                      <div className="text-white/40 text-xs mt-1 space-y-0.5">
                        {p.date && <div>📅 {new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>}
                        {p.time && <div>⏰ {formatTime(p.time)}</div>}
                        {p.location && <div>📍 {p.location}</div>}
                        {p.notes && <div>📝 {p.notes.substring(0, 80)}{p.notes.length > 80 ? "..." : ""}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={confirmImport} disabled={importPreview.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                Add to Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit event form */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-ocean-900 rounded-t-3xl w-full max-w-lg border-t border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-white font-display text-xl">{editingEvent ? "Edit Event" : "Add Event"}</h3>
                <button onClick={() => { setShowForm(false); setEditingEvent(null); }} className="text-white/40 hover:text-white/70 p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">What</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Dinner at Nobu, Aquaventure, etc."
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50" />
              </div>
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 outline-none focus:ring-1 focus:ring-mint/50 [color-scheme:dark]" />
              </div>
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_TYPES.map((t) => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${type === t.id ? "bg-white/15 text-white ring-1 ring-mint/40" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Where (optional)</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Restaurant name, pool area, etc."
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50" />
              </div>
              <div className="mb-6">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Confirmation #, dress code, etc." rows={2}
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50 resize-none" />
              </div>
              <div className="flex gap-3">
                {editingEvent && (
                  <button onClick={() => deleteEvent(editingEvent.id)}
                    className="py-3.5 px-5 rounded-xl bg-coral/10 text-coral font-semibold text-sm hover:bg-coral/20 transition-colors">Delete</button>
                )}
                <button onClick={saveEvent} disabled={!title.trim()}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-coral to-pink text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
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
