import { colors, radii } from "@/lib/design-tokens";
import { linearUrl, type Change } from "@/lib/changes-data";

/**
 * ChangeOpenCard — yellow callout for an unresolved trip decision.
 *
 * Anatomy (per NEG-72 spec):
 *   - Yellow background, red "NEEDS INPUT" badge in the top-right
 *   - Title (Inter Semibold 18, navy)
 *   - "Why it's open" body (Inter 13, navy, 2-3 sentences)
 *   - Options bulleted list
 *   - "Decide →" link that opens the Linear ticket in a new tab
 */

export interface ChangeOpenCardProps {
  change: Change;
  className?: string;
}

export function ChangeOpenCard({ change, className }: ChangeOpenCardProps) {
  const href = change.linearId ? linearUrl(change.linearId) : undefined;

  return (
    <article
      data-testid="change-open-card"
      data-change-id={change.id}
      className={className}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "20px 16px 16px",
        background: colors.yellow,
        border: `1px solid ${colors.yellow}`,
        borderRadius: radii.lg,
        fontFamily: "var(--font-inter)",
        color: colors.ink,
      }}
    >
      <span
        data-testid="change-open-card-badge"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 10px",
          background: colors.red,
          color: colors.gold,
          fontFamily: "var(--font-archivo-black)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          borderRadius: radii.pill,
          lineHeight: 1,
        }}
      >
        NEEDS INPUT
      </span>

      <h3
        data-testid="change-open-card-title"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.25,
          margin: 0,
          paddingRight: 96, // leave room for the badge
          color: colors.ink,
        }}
      >
        {change.title}
      </h3>

      <p
        data-testid="change-open-card-why"
        style={{
          fontSize: 13,
          lineHeight: 1.45,
          margin: 0,
          color: colors.ink,
        }}
      >
        {change.why}
      </p>

      {change.options && change.options.length > 0 && (
        <ul
          data-testid="change-open-card-options"
          style={{
            margin: 0,
            padding: "0 0 0 18px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 13,
            lineHeight: 1.4,
            color: colors.ink,
          }}
        >
          {change.options.map((opt, i) => (
            <li key={i}>{opt}</li>
          ))}
        </ul>
      )}

      {href && (
        <a
          data-testid="change-open-card-cta"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            marginTop: 4,
            background: colors.ink,
            color: colors.cream,
            fontFamily: "var(--font-archivo-black)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: radii.pill,
          }}
        >
          Decide →
        </a>
      )}
    </article>
  );
}

export default ChangeOpenCard;
