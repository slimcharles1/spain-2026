"use client";

import type { ScheduleEvent } from "@/lib/schedule-data";
import type { EventState } from "@/lib/schedule-state";
import {
  colors,
  eventSurfaces,
  eventTypes,
  radii,
  type EventType,
} from "@/lib/design-tokens";
import Badge from "./Badge";

/**
 * EventCard — tiered surface tile that renders a single schedule event.
 *
 * State surfaces (from NEG-64 tokens):
 *   past   : cream @ 0.6 opacity, ink strike-through, stroke border
 *   now    : cobalt surface, gold title, cream body — the only blue card on screen
 *   next   : yellow surface, ink text
 *   future : cream surface with stroke (thin LATER row)
 *
 * Variants:
 *   hero    : full card with title + body (used for NOW / NEXT / hero future)
 *   row     : 56px-min compact LATER row with left color bar + chevron
 *
 * Tap dispatches a `CustomEvent('open-event', { detail: event })` so NEG-66's
 * modal can listen and open without a prop drill.
 */
export type EventCardVariant = "hero" | "row";

export interface EventCardProps {
  event: ScheduleEvent;
  state: EventState;
  variant?: EventCardVariant;
  /** Override the default dispatch. Still fires if provided. */
  onTap?: (event: ScheduleEvent) => void;
  /** Optional children render below the description (callouts, attendees). */
  children?: React.ReactNode;
}

function formatTime(time: string): string {
  // 24-hour time per spec; no conversion.
  return time;
}

function openEvent(event: ScheduleEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("open-event", { detail: event }));
}

export function EventCard({
  event,
  state,
  variant = "hero",
  onTap,
  children,
}: EventCardProps) {
  const surface = eventSurfaces[state];
  const typeMeta = eventTypes[event.type as EventType];

  const handleClick = () => {
    onTap?.(event);
    openEvent(event);
  };

  if (variant === "row") {
    return (
      <button
        type="button"
        data-testid="event-card"
        data-state={state}
        data-variant="row"
        data-event-id={event.id}
        onClick={handleClick}
        style={{
          width: "100%",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px 10px 0",
          background: colors.cream,
          border: `1px solid ${colors.stroke}`,
          borderRadius: radii.lg,
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "var(--font-lm-body)",
          overflow: "hidden",
          opacity: state === "past" ? 0.55 : 1,
        }}
      >
        {/* Left color bar — event-type base color */}
        <span
          aria-hidden="true"
          style={{
            width: 4,
            alignSelf: "stretch",
            background: typeMeta?.base ?? colors.gray,
            flexShrink: 0,
          }}
        />

        {/* Time */}
        <span
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 13,
            color: colors.ink,
            minWidth: 44,
          }}
        >
          {formatTime(event.time)}
        </span>

        {/* Title + optional sub */}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.ink,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textDecoration: state === "past" ? "line-through" : "none",
            }}
          >
            {event.title}
          </span>
          {event.location?.name && (
            <span
              style={{
                fontSize: 11,
                color: colors.gray,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {event.location.name}
            </span>
          )}
        </span>

        {/* Chevron */}
        <span
          aria-hidden="true"
          style={{
            fontSize: 16,
            color: colors.gray,
            marginRight: 10,
            flexShrink: 0,
          }}
        >
          →
        </span>
      </button>
    );
  }

  // Hero variant
  const isNow = state === "now";
  const isNext = state === "next";
  const titleColor = isNow ? colors.gold : colors.ink;
  const bodyColor = isNow ? colors.cream : isNext ? colors.ink : colors.gray;
  const borderColor =
    "border" in surface && surface.border ? surface.border : colors.stroke;

  return (
    <button
      type="button"
      data-testid="event-card"
      data-state={state}
      data-variant="hero"
      data-event-id={event.id}
      onClick={handleClick}
      style={{
        width: "100%",
        display: "block",
        textAlign: "left",
        cursor: "pointer",
        background: surface.surface,
        border: `1px solid ${borderColor}`,
        borderRadius: radii.xl,
        padding: 16,
        fontFamily: "var(--font-lm-body)",
        opacity: "opacity" in surface ? surface.opacity : 1,
        marginBottom: 12,
      }}
    >
      {/* Top row: time + state chip */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 14,
            color: isNow ? colors.gold : colors.ink,
            letterSpacing: "0.04em",
          }}
        >
          {formatTime(event.time)}
        </span>
        {isNow && <Badge variant="now">NOW</Badge>}
        {isNext && <Badge variant="next">NEXT</Badge>}
        {state === "past" && <Badge variant="done">DONE</Badge>}
      </span>

      {/* Title */}
      <span
        style={{
          display: "block",
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.2,
          color: titleColor,
          textDecoration: state === "past" ? "line-through" : "none",
        }}
      >
        {typeMeta?.emoji ? `${typeMeta.emoji} ` : ""}
        {event.title}
      </span>

      {/* Description */}
      {event.description && (
        <span
          style={{
            display: "block",
            marginTop: 6,
            fontSize: 13,
            lineHeight: 1.4,
            color: bodyColor,
          }}
        >
          {event.description}
        </span>
      )}

      {children && <span style={{ display: "block", marginTop: 12 }}>{children}</span>}
    </button>
  );
}

export default EventCard;
