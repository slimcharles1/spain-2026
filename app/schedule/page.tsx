"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { tripDays } from "@/lib/schedule-data";
import { useSpainTime, getEventStates, getTripDayNumber, getSpainDateString } from "@/lib/time-utils";
import { useTheme } from "@/components/ThemeProvider";
import DayPicker from "@/components/DayPicker";
import TimelineEvent from "@/components/TimelineEvent";

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleContent />
    </Suspense>
  );
}

function ScheduleContent() {
  const spainTime = useSpainTime();
  const { setThemeOverride } = useTheme();
  const timelineRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);
  const searchParams = useSearchParams();

  // Default to query param day, today's trip day, or Day 1
  const todayDayNum = getTripDayNumber();
  const queryDay = searchParams.get("day");
  const initialDay = queryDay ? parseInt(queryDay, 10) : (todayDayNum ?? 1);
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const day = tripDays.find((d) => d.dayNumber === selectedDay)!;
  const isToday = day.date === getSpainDateString();
  const eventStates = isToday ? getEventStates(day.events, spainTime) : new Map();

  // Apply Real Madrid theme when Day 2 is selected
  useEffect(() => {
    if (selectedDay === 2) {
      setThemeOverride("real-madrid");
    } else {
      setThemeOverride(null);
    }
    return () => setThemeOverride(null);
  }, [selectedDay, setThemeOverride]);

  // Auto-scroll to "now" or "next" event on first load for today
  useEffect(() => {
    if (!isToday || hasAutoScrolled.current) return;
    hasAutoScrolled.current = true;

    const nowEl = timelineRef.current?.querySelector('[data-state="now"]');
    const nextEl = timelineRef.current?.querySelector('[data-state="next"]');
    const target = nowEl || nextEl;

    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isToday, spainTime]);

  // Reset auto-scroll flag when day changes
  const handleSelectDay = useCallback((dayNum: number) => {
    setSelectedDay(dayNum);
    hasAutoScrolled.current = false;
  }, []);

  // Swipe to change day
  const touchStart = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 80) {
      if (diff < 0 && selectedDay < 7) handleSelectDay(selectedDay + 1);
      if (diff > 0 && selectedDay > 1) handleSelectDay(selectedDay - 1);
    }
    touchStart.current = null;
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <div
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: "var(--theme-accent, #C0392B)" }}
        >
          Day {day.dayNumber} · {day.weekday}
        </div>
        <h1
          className="text-[28px] mt-1 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
        >
          {day.emoji} {day.title}
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--theme-text-secondary, #666)" }}>
          {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {day.city}
        </p>
        {selectedDay === 2 && (
          <p className="text-[12px] mt-1 font-semibold" style={{ color: "var(--theme-accent-secondary)" }}>
            🎂 Tony&apos;s Birthday + Match Day
          </p>
        )}
      </div>

      {/* Day picker — sticky */}
      <div className="sticky top-0 z-30" style={{ background: "var(--theme-bg)" }}>
        <DayPicker selectedDay={selectedDay} onSelectDay={handleSelectDay} />
      </div>

      {/* Summary */}
      <div className="px-5 py-3">
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--theme-text-secondary, #555)" }}>
          {day.summary}
        </p>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="px-5 pb-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {day.events.map((event, i) => {
          const state = isToday
            ? eventStates.get(event.id) || "future"
            : "future";

          return (
            <div key={event.id} data-state={state}>
              <TimelineEvent
                event={event}
                state={state}
                isLast={i === day.events.length - 1}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
