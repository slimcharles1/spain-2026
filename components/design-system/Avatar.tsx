import { personColors, personNames, type Person } from "@/lib/design-tokens";

/**
 * Avatar — single-person color circle.
 *
 * Full first name renders INSIDE the circle when:
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
      {renderName ? name : ""}
    </span>
  );
}

export default Avatar;
