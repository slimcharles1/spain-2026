"use client";

import { useRef, useEffect } from "react";
import { colors } from "@/lib/design-tokens";
import DayPill from "./DayPill";

/**
 * DayPicker — horizontal-scroll row of DayPill chips.
 *
 * Spec (NEG-65): days 1..7 with dayNumber + weekday short code, selected
 * variant in cobalt + gold. Tap switches active day. Auto-scrolls the
 * selected pill into view.
 */
export interface DayPickerDay {
  /** Trip day number (1..7) — what the rest of the app uses to key into data. */
  day: number;
  /** Displayed day-of-week short code, e.g. "SAT". Uppercased. */
  weekday: string;
  /** Displayed day-of-month (1..31). */
  dayOfMonth: number;
}

export interface DayPickerProps {
  days: DayPickerDay[];
  selected: number;
  onSelect: (day: number) => void;
  className?: string;
}

export function DayPicker({ days, selected, onSelect, className }: DayPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Auto-scroll selected pill into view on mount + when selected changes.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-day="${selected}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selected]);

  return (
    <div
      ref={ref}
      data-testid="day-picker"
      role="tablist"
      aria-label="Trip day"
      className={className}
      style={{
        display: "flex",
        gap: 8,
        padding: "12px 16px",
        overflowX: "auto",
        background: colors.cream,
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {days.map((d) => (
        <DayPill
          key={d.day}
          dayNumber={d.dayOfMonth}
          dayOfWeek={d.weekday}
          selected={d.day === selected}
          onClick={() => onSelect(d.day)}
          aria-label={`Day ${d.day} (${d.weekday})`}
        />
      ))}
    </div>
  );
}

export default DayPicker;
