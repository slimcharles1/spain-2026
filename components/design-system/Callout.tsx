import { colors, radii } from "@/lib/design-tokens";

/**
 * Callout — info block with a colored label pill + body copy.
 * - protip:    yellow surface / red label
 * - advisory:  cream surface / cobalt label
 * - dresscode: cream surface / cobalt label
 * - seating:   cream surface / cobalt label
 *
 * The non-protip variants share navy-blue/gold treatment for the label.
 */
export type CalloutVariant = "protip" | "advisory" | "dresscode" | "seating";

export interface CalloutProps {
  variant: CalloutVariant;
  /** Short uppercase label, e.g. "PRO TIP". */
  label: string;
  /** Body copy. Can be a string or rich nodes. */
  body: React.ReactNode;
  className?: string;
}

type Tone = { surface: string; border: string; labelBg: string; labelFg: string; body: string };

const tones: Record<CalloutVariant, Tone> = {
  protip: {
    surface: colors.yellow,
    border: colors.yellow,
    labelBg: colors.red,
    labelFg: colors.gold,
    body: colors.ink,
  },
  advisory: {
    surface: colors.cream,
    border: colors.stroke,
    labelBg: colors.cobalt,
    labelFg: colors.gold,
    body: colors.ink,
  },
  dresscode: {
    surface: colors.cream,
    border: colors.stroke,
    labelBg: colors.cobalt,
    labelFg: colors.gold,
    body: colors.ink,
  },
  seating: {
    surface: colors.cream,
    border: colors.stroke,
    labelBg: colors.cobalt,
    labelFg: colors.gold,
    body: colors.ink,
  },
};

export function Callout({ variant, label, body, className }: CalloutProps) {
  const tone = tones[variant];

  return (
    <aside
      data-testid="callout"
      data-variant={variant}
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 16,
        background: tone.surface,
        border: `1px solid ${tone.border}`,
        borderRadius: radii.lg,
        fontFamily: "var(--font-lm-body)",
        color: tone.body,
      }}
    >
      <span
        data-testid="callout-label"
        style={{
          alignSelf: "flex-start",
          display: "inline-flex",
          padding: "3px 8px",
          background: tone.labelBg,
          color: tone.labelFg,
          fontFamily: "var(--font-lm-display)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          borderRadius: radii.sm,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <div data-testid="callout-body" style={{ fontSize: 14, lineHeight: 1.4 }}>
        {body}
      </div>
    </aside>
  );
}

export default Callout;
