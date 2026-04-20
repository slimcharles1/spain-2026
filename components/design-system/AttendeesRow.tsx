"use client";

import { colors, personNames, type Person } from "@/lib/design-tokens";
import Avatar from "./Avatar";

/**
 * AttendeesRow — stacked avatars + uppercase label.
 *
 * Two canonical variants per the NEG-65 spec:
 *   ALL 4:       all four personas in trip order + "ALL 4" or "ALL 4 TOGETHER"
 *   GUYS ONLY:   charles + tony + "GUYS ONLY · CHARLES + TONY"
 *
 * Label is auto-generated from `persons` unless explicitly supplied.
 */
export interface AttendeesRowProps {
  persons: Person[];
  /** Override label. Auto-generated when omitted. */
  label?: string;
  /** Optional inline tone — "light" inverts text color for dark (cobalt) cards. */
  tone?: "dark" | "light";
  className?: string;
}

const ALL_ORDER: Person[] = ["ang", "carly", "charles", "tony"];

function defaultLabel(persons: Person[]): string {
  const set = new Set(persons);
  const isAll = ALL_ORDER.every((p) => set.has(p));
  if (isAll) return "ALL 4";
  const guys: Person[] = ["charles", "tony"];
  const girls: Person[] = ["ang", "carly"];
  const isGuys = guys.every((p) => set.has(p)) && persons.length === 2;
  const isGirls = girls.every((p) => set.has(p)) && persons.length === 2;
  if (isGuys) return "GUYS ONLY · CHARLES + TONY";
  if (isGirls) return "GIRLS · ANG + CARLY";
  return persons.map((p) => personNames[p].toUpperCase()).join(" + ");
}

export function AttendeesRow({
  persons,
  label,
  tone = "dark",
  className,
}: AttendeesRowProps) {
  const resolvedLabel = label ?? defaultLabel(persons);
  const labelColor = tone === "light" ? colors.cream : colors.gray;

  return (
    <span
      data-testid="attendees-row"
      data-count={persons.length}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--font-lm-body)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {persons.map((p, i) => (
          <span
            key={p}
            style={{
              marginLeft: i === 0 ? 0 : -8,
              // Stroke ring helps separate overlapping avatars
              border: `2px solid ${tone === "light" ? colors.cobalt : colors.cream}`,
              borderRadius: 999,
              display: "inline-flex",
            }}
          >
            <Avatar person={p} size={24} />
          </span>
        ))}
      </span>
      <span
        style={{
          fontFamily: "var(--font-lm-display)",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: labelColor,
          textTransform: "uppercase",
        }}
      >
        {resolvedLabel}
      </span>
    </span>
  );
}

export default AttendeesRow;
