import { colors, radii } from "@/lib/design-tokens";
import { linearUrl, type Change } from "@/lib/changes-data";

/**
 * ChangeDoneCard — cream log entry for a settled trip decision.
 *
 * Anatomy (per NEG-72 spec):
 *   - Cream background with stroke border
 *   - Green "✓ DONE" check on the left
 *   - Title (Inter Semibold 15, navy)
 *   - One-line rationale (Inter 12, gray, italic) — uses `decided` as the
 *     headline and falls back to `why` if no `decided` is set.
 *   - Date (Inter 11, gray) + optional Linear link
 */

export interface ChangeDoneCardProps {
  change: Change;
  className?: string;
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  // Treat the ISO date as a date-only value; noon avoids tz drift.
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ChangeDoneCard({ change, className }: ChangeDoneCardProps) {
  const href = change.linearId ? linearUrl(change.linearId) : undefined;
  const dateLabel = formatDate(change.decidedAt);
  const rationale = change.decided ?? change.why;

  return (
    <article
      data-testid="change-done-card"
      data-change-id={change.id}
      className={className}
      style={{
        display: "flex",
        gap: 12,
        padding: 14,
        background: colors.cream,
        border: `1px solid ${colors.stroke}`,
        borderRadius: radii.lg,
        fontFamily: "var(--font-inter)",
        color: colors.ink,
      }}
    >
      <span
        data-testid="change-done-card-check"
        aria-hidden="true"
        style={{
          flex: "0 0 auto",
          width: 24,
          height: 24,
          borderRadius: radii.pill,
          background: colors.success,
          color: colors.white,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1,
          marginTop: 2,
        }}
      >
        ✓
      </span>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <h3
          data-testid="change-done-card-title"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.3,
            margin: 0,
            color: colors.ink,
          }}
        >
          {change.title}
        </h3>

        <p
          data-testid="change-done-card-rationale"
          style={{
            fontSize: 12,
            fontStyle: "italic",
            lineHeight: 1.4,
            margin: 0,
            color: colors.gray,
          }}
        >
          {rationale}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            color: colors.gray,
            marginTop: 2,
          }}
        >
          {dateLabel && <span data-testid="change-done-card-date">{dateLabel}</span>}
          {href && (
            <a
              data-testid="change-done-card-link"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: colors.cobalt,
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              {change.linearId}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ChangeDoneCard;
