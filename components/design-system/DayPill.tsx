import { colors, radii } from "@/lib/design-tokens";

/**
 * DayPill — compact day picker chip. Stacks day-of-week abbreviation over day number.
 * Selected variant: cobalt fill / gold number. Unselected: cream / ink.
 */
export interface DayPillProps {
  /** Integer day number (displayed prominently). */
  dayNumber: number;
  /** Short day-of-week, e.g. "Fri". */
  dayOfWeek: string;
  /** Visual size in px. Default: 48. */
  size?: 40 | 48 | 56 | 64;
  selected?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

export function DayPill({
  dayNumber,
  dayOfWeek,
  size = 48,
  selected = false,
  onClick,
  ...rest
}: DayPillProps) {
  const label = rest["aria-label"] ?? `Day ${dayNumber} (${dayOfWeek})`;

  return (
    <button
      type="button"
      data-testid="day-pill"
      data-selected={selected ? "true" : "false"}
      data-day={dayNumber}
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      style={{
        width: size,
        height: size + 8,
        borderRadius: radii.lg,
        background: selected ? colors.cobalt : colors.cream,
        border: `1px solid ${selected ? colors.cobalt : colors.stroke}`,
        color: selected ? colors.gold : colors.ink,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        padding: 4,
        cursor: onClick ? "pointer" : "default",
        fontFamily: "var(--font-lm-body)",
        transition: "background 120ms ease, color 120ms ease, transform 120ms ease",
        transform: selected ? "translateY(-2px)" : "none",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: selected ? 0.85 : 0.6,
        }}
      >
        {dayOfWeek}
      </span>
      <span
        style={{
          fontFamily: "var(--font-lm-display)",
          fontSize: Math.round(size * 0.42),
          lineHeight: 1,
        }}
      >
        {dayNumber}
      </span>
    </button>
  );
}

export default DayPill;
