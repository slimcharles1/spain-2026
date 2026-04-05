"use client";

import { useState } from "react";
import type { ScheduleEvent } from "@/lib/schedule-data";
import type { EventState } from "@/lib/time-utils";
import AppleMapsButton from "./AppleMapsButton";

interface TimelineEventProps {
  event: ScheduleEvent;
  state: EventState;
  isLast?: boolean;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const typeEmojis: Record<string, string> = {
  travel: "✈️",
  dining: "🍽️",
  wine: "🍷",
  culture: "🏛️",
  activity: "🚶",
  hotel: "🏨",
  sport: "⚽",
  free: "☀️",
};

export default function TimelineEvent({ event, state, isLast }: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false);

  const dotStyles: Record<EventState, React.CSSProperties> = {
    past: { background: "#ccc", width: 10, height: 10 },
    now: { background: "#C0392B", width: 12, height: 12 },
    next: { background: "#D4A843", width: 10, height: 10 },
    future: { background: "var(--theme-card, white)", border: "2px solid var(--theme-border)", width: 10, height: 10 },
  };

  const borderColors: Record<EventState, string> = {
    past: "transparent",
    now: "#C0392B",
    next: "#D4A843",
    future: "transparent",
  };

  const badgeConfig: Record<string, { label: string; bg: string; text: string } | null> = {
    past: null,
    now: { label: "NOW", bg: "#C0392B", text: "white" },
    next: { label: "NEXT", bg: "#D4A843", text: "#1B2A4A" },
    future: null,
  };

  const badge = badgeConfig[state];
  const opacity = state === "past" ? 0.45 : state === "future" ? 0.85 : 1;

  return (
    <div className="flex gap-3 relative" style={{ opacity }}>
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 w-5">
        <div
          className={`rounded-full shrink-0 relative z-10 ${state === "now" ? "animate-pulse-ring" : ""}`}
          style={{
            ...dotStyles[state],
            marginTop: 6,
          }}
        />
        {!isLast && (
          <div
            className="w-0.5 flex-1 mt-1"
            style={{
              background: state === "past" ? "rgba(27, 42, 74, 0.08)" : "rgba(27, 42, 74, 0.1)",
              backgroundImage: state === "past" ? "repeating-linear-gradient(to bottom, rgba(27,42,74,0.08) 0px, rgba(27,42,74,0.08) 4px, transparent 4px, transparent 8px)" : "none",
            }}
          />
        )}
      </div>

      {/* Event card */}
      <div
        className="flex-1 mb-4 rounded-xl p-3.5 transition-all duration-300"
        style={{
          background: "var(--theme-card, white)",
          borderLeft: `3px solid ${borderColors[state]}`,
          boxShadow: state === "now"
            ? "0 1px 8px rgba(192, 57, 43, 0.08)"
            : state === "next"
            ? "0 1px 4px rgba(0, 0, 0, 0.04)"
            : state === "future"
            ? "0 1px 2px rgba(0, 0, 0, 0.03)"
            : "none",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold tracking-wide" style={{ color: "var(--theme-text)" }}>
                {formatTime(event.time)}
              </span>
              {badge && (
                <span
                  className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded"
                  style={{ background: badge.bg, color: badge.text }}
                >
                  {badge.label}
                </span>
              )}
              {event.splitGroup && (
                <span className="text-[10px] opacity-50">
                  {event.splitGroup === "guys" ? "👨‍👦" : "👩‍👧"}
                </span>
              )}
            </div>
            <h3
              className="text-[15px] font-semibold mt-1 leading-tight"
              style={{ color: "var(--theme-text)", fontFamily: "var(--font-body)" }}
            >
              <span className="mr-1.5">{typeEmojis[event.type] || "📌"}</span>
              {event.title}
            </h3>
          </div>

          {event.location && (
            <AppleMapsButton location={event.location} variant="icon" />
          )}
        </div>

        {/* Description */}
        <p
          className={`text-[13px] mt-2 leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}
          style={{ color: "var(--theme-text-secondary, #666)" }}
        >
          {event.description}
        </p>

        {/* Tip */}
        {event.tip && (expanded || state === "now" || state === "next") && (
          <div
            className="mt-2 px-3 py-2 rounded-lg text-[12px] leading-relaxed"
            style={{ background: "rgba(212, 168, 67, 0.1)", color: "#7a6530" }}
          >
            <strong style={{ color: "#D4A843" }}>Tip: </strong>
            {event.tip}
          </div>
        )}

        {/* Confirmation */}
        {event.confirmation && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[11px] font-bold tracking-wider" style={{ color: "#C0392B" }}>
              {event.confirmation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
