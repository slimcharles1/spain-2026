import { personColors, personNames, type Person } from "@/lib/design-tokens";

/**
 * In-circle display label per person. Charles renders as initials ("CJ")
 * so a 64px circle doesn't crowd; others keep their first name.
 * The aria-label still uses the full name from personNames for a11y.
 */
const DISPLAY_NAME: Record<Person, string> = {
  ang: "Ang",
  carly: "Carly",
  charles: "CJ",
  tony: "Tony",
};

/**
 * Avatar — single-person color circle.
 *
 * In-circle display label (from DISPLAY_NAME) renders when:
 *   - size is >= 48, OR
 *   - showName is explicitly set to true.
 *
 * Otherwise renders a color-only circle (no label).
 */
export interface AvatarProps {
  person: Person;
  size?: 24 | 32 | 36 | 48 | 64 | number;
  /** Force name rendering regardless of size. */
  showName?: boolean;
  className?: string;
}

export function Avatar({ person, size = 32, showName, className }: AvatarProps) {
  const color = personColors[person];
  const name = personNames[person];
  const label = DISPLAY_NAME[person];
  const renderName = showName ?? size >= 48;

  return (
    <span
      data-testid="avatar"
      data-person={person}
      data-size={size}
      data-show-name={renderName ? "true" : "false"}
      aria-label={name}
      role="img"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        color: "#FFFFFF",
        fontFamily: "var(--font-lm-body)",
        fontWeight: 700,
        fontSize: Math.max(10, Math.round(size * 0.28)),
        letterSpacing: "-0.01em",
        lineHeight: 1,
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {renderName ? label : ""}
    </span>
  );
}

export default Avatar;
