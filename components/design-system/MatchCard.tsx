"use client";

import { colors, radii, type Person } from "@/lib/design-tokens";
import AttendeesRow from "./AttendeesRow";

/**
 * MatchCard — Day 2 Sevilla FC vs Real Madrid fixture card.
 *
 * Mimics a match-ticket: yellow surface, two club names with "vs" crest,
 * venue, seating + dress code callouts, attendees chip, and CTA buttons
 * (tickets + directions). Per NEG-65: neutral dress-code reminder since
 * the seats are in a mixed-seating section.
 */
export interface MatchCardProps {
  home: string;
  away: string;
  /** 24-hour kickoff string, e.g. "20:30". */
  kickoff: string;
  venue: string;
  seating: string;
  dressCode: string;
  attendees: Person[];
  /** Optional tap handlers for the CTAs. Wire via NEG-66. */
  onTickets?: () => void;
  onDirections?: () => void;
  className?: string;
}

export function MatchCard({
  home,
  away,
  kickoff,
  venue,
  seating,
  dressCode,
  attendees,
  onTickets,
  onDirections,
  className,
}: MatchCardProps) {
  return (
    <div
      data-testid="match-card"
      data-kickoff={kickoff}
      className={className}
      style={{
        background: colors.yellow,
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.xl,
        padding: 16,
        fontFamily: "var(--font-lm-body)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Row 1: "NEXT · MATCH" label + kickoff time */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: colors.red,
          }}
        >
          NEXT · MATCH
        </span>
        <span
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 16,
            color: colors.ink,
            letterSpacing: "0.04em",
          }}
        >
          {kickoff}
        </span>
      </div>

      {/* Matchup: HOME vs AWAY */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, textAlign: "left" }}>
          <div
            style={{
              fontFamily: "var(--font-lm-display)",
              fontSize: 22,
              lineHeight: 1.05,
              color: colors.red,
              letterSpacing: "-0.01em",
            }}
            data-testid="match-home"
          >
            {home.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              color: colors.ink,
              fontWeight: 700,
              marginTop: 2,
            }}
          >
            HOME
          </div>
        </div>
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 18,
            color: colors.ink,
          }}
        >
          vs
        </span>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-lm-display)",
              fontSize: 22,
              lineHeight: 1.05,
              color: colors.ink,
              letterSpacing: "-0.01em",
            }}
            data-testid="match-away"
          >
            {away.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              color: colors.ink,
              fontWeight: 700,
              marginTop: 2,
            }}
          >
            AWAY
          </div>
        </div>
      </div>

      {/* Venue */}
      <div style={{ fontSize: 13, color: colors.ink }}>{venue}</div>

      {/* Seating callout */}
      <div
        style={{
          background: colors.cobalt,
          color: colors.cream,
          padding: "8px 12px",
          borderRadius: radii.md,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: colors.gold,
          }}
        >
          SEATING
        </div>
        <div style={{ fontSize: 12, marginTop: 2 }}>{seating}</div>
      </div>

      {/* Dress-code callout */}
      <div
        style={{
          background: colors.cobalt,
          color: colors.cream,
          padding: "8px 12px",
          borderRadius: radii.md,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-lm-display)",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: colors.gold,
          }}
        >
          👕 DRESS CODE
        </div>
        <div style={{ fontSize: 12, marginTop: 2 }}>{dressCode}</div>
      </div>

      {/* Attendees */}
      <AttendeesRow persons={attendees} />

      {/* CTAs */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          data-testid="match-tickets"
          onClick={onTickets}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: radii.md,
            background: colors.white,
            border: `1px solid ${colors.ink}`,
            color: colors.ink,
            fontFamily: "var(--font-lm-display)",
            fontSize: 11,
            letterSpacing: "0.12em",
            cursor: "pointer",
          }}
        >
          VIEW TICKETS
        </button>
        <button
          type="button"
          data-testid="match-directions"
          onClick={onDirections}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: radii.md,
            background: colors.red,
            border: `1px solid ${colors.red}`,
            color: colors.gold,
            fontFamily: "var(--font-lm-display)",
            fontSize: 11,
            letterSpacing: "0.12em",
            cursor: "pointer",
          }}
        >
          DIRECTIONS TO STADIUM
        </button>
      </div>
    </div>
  );
}

export default MatchCard;
