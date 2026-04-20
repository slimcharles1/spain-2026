import { colors, radii } from "@/lib/design-tokens";

/**
 * Button — 4 variants.
 * - primary:   red bg / gold label
 * - secondary: yellow bg / navy label
 * - outline:   transparent bg / navy stroke + label
 * - dark:      navy bg / white label
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "dark";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  /** Full-width (100%). */
  block?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: colors.red,
    color: colors.gold,
    border: `1px solid ${colors.red}`,
  },
  secondary: {
    background: colors.yellow,
    color: colors.ink,
    border: `1px solid ${colors.yellow}`,
  },
  outline: {
    background: "transparent",
    color: colors.ink,
    border: `1px solid ${colors.ink}`,
  },
  dark: {
    background: colors.ink,
    color: colors.white,
    border: `1px solid ${colors.ink}`,
  },
};

export function Button({
  variant = "primary",
  block = false,
  children,
  style,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      data-testid="button"
      data-variant={variant}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 20px",
        borderRadius: radii.lg,
        fontFamily: "var(--font-lm-display)",
        fontSize: 14,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        lineHeight: 1,
        cursor: rest.disabled ? "not-allowed" : "pointer",
        opacity: rest.disabled ? 0.5 : 1,
        width: block ? "100%" : undefined,
        transition: "transform 100ms ease, opacity 120ms ease",
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default Button;
