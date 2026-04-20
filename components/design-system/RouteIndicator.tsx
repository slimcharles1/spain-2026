"use client";

import { colors } from "@/lib/design-tokens";
import type { CityStop } from "@/lib/schedule-state";

/**
 * RouteIndicator — multi-city day-level route strip.
 *
 * Used by Day 3 (Jerez → Cádiz → Sevilla) and Day 5 (Seville → Córdoba →
 * La Mancha → Madrid). Renders each stop as a dot with a connector line.
 *
 *   past   : solid gray dot, solid gray connector after
 *   now    : cobalt filled dot with pulse ring, solid connector after
 *   sleep  : cobalt outline dot with "zzz" overlay (where we bed down)
 *   future : hollow cream dot, dashed connector
 *
 * Optional `meta` (e.g. "270 km · 3 legs") renders on the top-right.
 */
export interface RouteIndicatorProps {
  cities: CityStop[];
  /** e.g. "270 km · 3 legs" */
  meta?: string;
  /** Section label above the row. Defaults to "ROUTE". */
  label?: string;
  className?: string;
}

export function RouteIndicator({
  cities,
  meta,
  label = "ROUTE",
  className,
}: RouteIndicatorProps) {
  return (
    <div
      data-testid="route-indicator"
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "10px 16px",
        background: colors.cream,
        border: `1px solid ${colors.stroke}`,
        borderRadius: 12,
        fontFamily: "var(--font-lm-body)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: colors.gray,
          }}
        >
          {label}
        </span>
        {meta && (
          <span
            style={{
              fontFamily: "var(--font-lm-body)",
              fontSize: 11,
              color: colors.gray,
              letterSpacing: "0.04em",
            }}
          >
            {meta}
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        {cities.map((city, i) => {
          const isLast = i === cities.length - 1;
          return (
            <div
              key={`${city.name}-${i}`}
              data-testid="route-stop"
              data-status={city.status}
              style={{
                display: "flex",
                alignItems: "center",
                flex: isLast ? "0 0 auto" : "1 1 0%",
                minWidth: 0,
                gap: 6,
              }}
            >
              <CityDot status={city.status} />
              <span
                style={{
                  fontFamily: "var(--font-lm-display)",
                  fontSize: 12,
                  color: city.status === "future" ? colors.gray : colors.ink,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {city.name.toUpperCase()}
              </span>
              {!isLast && (
                <Connector
                  currentStatus={city.status}
                  nextStatus={cities[i + 1].status}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Status sub-labels */}
      <div style={{ display: "flex", width: "100%", fontSize: 10, color: colors.gray }}>
        {cities.map((city, i) => {
          const isLast = i === cities.length - 1;
          const sub =
            city.status === "now"
              ? "NOW"
              : city.status === "sleep"
                ? "SLEEP"
                : city.status === "past"
                  ? "DONE"
                  : "";
          return (
            <span
              key={`sub-${i}`}
              style={{
                flex: isLast ? "0 0 auto" : "1 1 0%",
                letterSpacing: "0.12em",
                color:
                  city.status === "now"
                    ? colors.red
                    : city.status === "sleep"
                      ? colors.cobalt
                      : colors.gray,
              }}
            >
              {sub}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CityDot({ status }: { status: CityStop["status"] }) {
  if (status === "now") {
    return (
      <span
        aria-hidden="true"
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: colors.cobalt,
          boxShadow: `0 0 0 4px ${colors.cobalt}33`,
          flexShrink: 0,
        }}
      />
    );
  }
  if (status === "past") {
    return (
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: colors.gray,
          flexShrink: 0,
        }}
      />
    );
  }
  if (status === "sleep") {
    return (
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: "transparent",
          border: `2px solid ${colors.cobalt}`,
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        background: "transparent",
        border: `2px solid ${colors.stroke}`,
        flexShrink: 0,
      }}
    />
  );
}

function Connector({
  currentStatus,
  nextStatus,
}: {
  currentStatus: CityStop["status"];
  nextStatus: CityStop["status"];
}) {
  const solid =
    currentStatus === "past" ||
    currentStatus === "now" ||
    nextStatus === "now";
  return (
    <span
      aria-hidden="true"
      style={{
        flex: 1,
        height: 0,
        borderTop: solid ? `2px solid ${colors.ink}` : `2px dashed ${colors.stroke}`,
        margin: "0 6px",
        minWidth: 12,
      }}
    />
  );
}

export default RouteIndicator;
