import { colors, radii } from "@/lib/design-tokens";

/**
 * Badge — NOW / NEXT / DONE state chip.
 * now, next: red background / gold text. done: cream background / gray text.
 * English chrome only (no Spanish).
 */
export type BadgeVariant = "now" | "next" | "done";

export interface BadgeProps {
  variant: BadgeVariant;
  /** Override label. Defaults to variant name uppercased. */
  children?: React.ReactNode;
  className?: string;
}

const styles: Record<BadgeVariant, React.CSSProperties> = {
  now: {
    background: colors.red,
    color: colors.gold,
  },
  next: {
    background: colors.red,
    color: colors.gold,
  },
  done: {
    background: colors.cream,
    color: colors.gray,
  },
};

const defaultLabels: Record<BadgeVariant, string> = {
  now: "NOW",
  next: "NEXT",
  done: "DONE",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      data-testid="badge"
      data-variant={variant}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: radii.pill,
        fontFamily: "var(--font-lm-display)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        lineHeight: 1,
        ...styles[variant],
      }}
    >
      {children ?? defaultLabels[variant]}
    </span>
  );
}

export default Badge;
