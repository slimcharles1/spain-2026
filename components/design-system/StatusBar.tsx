"use client";

import { useEffect, useState } from "react";
import { colors } from "@/lib/design-tokens";

/**
 * StatusBar — decorative iPhone-style status row.
 * Shows a 24-hour time on the left and three indicator dots on the right.
 * Purely cosmetic; for app-chrome feel on the mobile PWA.
 */
export interface StatusBarProps {
  /** Override the clock (useful for tests/screenshots). */
  time?: string;
  /** Color of time + dots. Default: ink. */
  color?: string;
}

function format24(d: Date): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function StatusBar({ time, color = colors.ink }: StatusBarProps) {
  const [now, setNow] = useState<string>(time ?? "");

  useEffect(() => {
    if (time) return;
    setNow(format24(new Date()));
    const id = setInterval(() => setNow(format24(new Date())), 30_000);
    return () => clearInterval(id);
  }, [time]);

  const display = time ?? now;

  return (
    <div
      data-testid="status-bar"
      role="presentation"
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 20px",
        fontFamily: "var(--font-lm-body)",
        fontWeight: 600,
        fontSize: 14,
        color,
        letterSpacing: "-0.01em",
      }}
    >
      <span data-testid="status-bar-time">{display}</span>
      <span style={{ display: "inline-flex", gap: 4 }}>
        <span style={dotStyle(color)} />
        <span style={dotStyle(color)} />
        <span style={dotStyle(color)} />
      </span>
    </div>
  );
}

function dotStyle(c: string): React.CSSProperties {
  return { width: 4, height: 4, borderRadius: 999, background: c, display: "inline-block" };
}

export default StatusBar;
