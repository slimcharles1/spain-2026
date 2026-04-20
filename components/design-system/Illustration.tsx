import { eventTypes, type EventType, radii } from "@/lib/design-tokens";

/**
 * Illustration — hero block for an event card.
 * 135deg linear gradient from the event type's `light` → `base`, centered 72pt emoji.
 */
export interface IllustrationProps {
  type: EventType;
  /** Optional override for the emoji. Defaults to the token-specified one. */
  emoji?: string;
  /** Square size in px. Default: 96. Emoji scales with container. */
  size?: number;
  /** Corner radius. Default: radii.lg. */
  radius?: number;
  /** Optional aria-label override. */
  label?: string;
  className?: string;
}

export function Illustration({
  type,
  emoji,
  size = 96,
  radius = radii.lg,
  label,
  className,
}: IllustrationProps) {
  const token = eventTypes[type];
  const glyph = emoji ?? token.emoji;

  return (
    <div
      data-testid="illustration"
      data-type={type}
      role="img"
      aria-label={label ?? `${type} illustration`}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${token.light} 0%, ${token.base} 100%)`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <span
        data-testid="illustration-glyph"
        style={{
          fontSize: Math.round(size * 0.75),
          lineHeight: 1,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
        }}
      >
        {glyph}
      </span>
    </div>
  );
}

export default Illustration;
