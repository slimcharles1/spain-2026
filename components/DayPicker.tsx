"use client";

import { useRef, useEffect } from "react";
import { tripDays } from "@/lib/schedule-data";
import { getSpainDateString } from "@/lib/time-utils";

interface DayPickerProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export default function DayPicker({ selectedDay, onSelectDay }: DayPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayDate = getSpainDateString();

  useEffect(() => {
    // Auto-scroll to selected day
    const container = scrollRef.current;
    if (!container) return;
    const selectedEl = container.querySelector(`[data-day="${selectedDay}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedDay]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-5 py-3 snap-x"
      style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
    >
      {tripDays.map((day) => {
        const isSelected = day.dayNumber === selectedDay;
        const isToday = day.date === todayDate;

        return (
          <button
            key={day.dayNumber}
            data-day={day.dayNumber}
            onClick={() => onSelectDay(day.dayNumber)}
            className="flex flex-col items-center gap-0.5 px-3.5 py-2.5 rounded-xl shrink-0 snap-center transition-all duration-200 min-w-[72px]"
            style={{
              background: isSelected ? "var(--theme-text, #1B2A4A)" : "var(--theme-card, white)",
              color: isSelected ? "var(--theme-bg, white)" : "var(--theme-text, #1B2A4A)",
              border: isSelected ? "none" : "1px solid var(--theme-border)",
              transform: isSelected ? "translateY(-2px)" : "none",
              boxShadow: isSelected ? "0 4px 12px rgba(27, 42, 74, 0.15)" : "none",
            }}
          >
            <span className="text-[10px] font-bold tracking-wider uppercase opacity-60">
              {day.weekday.slice(0, 3)}
            </span>
            <span className="text-lg">{day.emoji}</span>
            <span className="text-[11px] font-semibold">Day {day.dayNumber}</span>
            <span className="text-[10px] opacity-50">{day.date.slice(5)}</span>
            {isToday && !isSelected && (
              <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#C0392B" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
