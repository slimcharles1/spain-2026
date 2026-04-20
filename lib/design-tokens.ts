/**
 * La Movida Refined — design tokens
 *
 * Single source of truth for the Spain 2026 Trip App design system.
 * Palette, eventTypes, typography scale, spacing, radii, shadows.
 *
 * Do NOT hardcode hex values in components. Import from here or reference
 * the CSS custom properties defined in `app/globals.css` under @theme.
 */

export const colors = {
  red: "#CC2E2C",
  yellow: "#FFD23F",
  cobalt: "#1E4D92",
  pink: "#FF3E7F",
  cream: "#F5F1E8",
  ink: "#1B2A4A",
  gray: "#6B6B6B",
  stroke: "#D8D1C0",
  gold: "#FEBE10",
  success: "#4A7C3E",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export type ColorToken = keyof typeof colors;

export const eventTypes = {
  dining: { base: "#E8A94F", light: "#FCEDD8", emoji: "\uD83C\uDF7D\uFE0F" },
  wine: { base: "#B8476D", light: "#EDD6DE", emoji: "\uD83C\uDF77" },
  culture: { base: "#7B5CB8", light: "#EFE5F5", emoji: "\uD83C\uDFDB\uFE0F" },
  activity: { base: "#E37A5A", light: "#FBE3D4", emoji: "\u2728" },
  sport: { base: "#1E4D92", light: "#D4E2F0", emoji: "\u26BD" },
  hotel: { base: "#2A8F7E", light: "#DCEEE8", emoji: "\uD83C\uDFE8" },
  travel: { base: "#3B6EA5", light: "#DCE7F0", emoji: "\u2708\uFE0F" },
  free: { base: "#FEBE10", light: "#FCF5DE", emoji: "\uD83C\uDF1E" },
} as const;

export type EventType = keyof typeof eventTypes;

/**
 * Fixed per-person avatar colors — alphabetical order matches persona-select.
 * Tuned for WCAG AA on white initials.
 */
export const personColors = {
  ang: "#B8476D",
  carly: "#E37A5A",
  charles: "#1E4D92",
  tony: "#2A8F7E",
} as const;

export type Person = keyof typeof personColors;

export const personNames: Record<Person, string> = {
  ang: "Ang",
  carly: "Carly",
  charles: "Charles",
  tony: "Tony",
};

export const typography = {
  fontFamily: {
    display: "var(--font-archivo-black), 'Archivo Black', sans-serif",
    body: "var(--font-inter), 'Inter', system-ui, sans-serif",
  },
  fontWeight: {
    regular: 400,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  size: {
    hero: 48,
    title: 32,
    h1: 24,
    h2: 20,
    body: 16,
    small: 14,
    meta: 12,
    micro: 10,
  },
  letterSpacing: {
    display: "-0.01em",
    tracked: "0.08em",
    wide: "0.16em",
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  pill: 999,
} as const;

export const shadows = {
  card: "0 1px 2px rgba(27, 42, 74, 0.04), 0 4px 16px rgba(27, 42, 74, 0.06)",
  lift: "0 4px 12px rgba(27, 42, 74, 0.12)",
  modal: "0 24px 64px rgba(27, 42, 74, 0.2)",
} as const;

/**
 * Poster stripe — signature 4-color motif. 4px tall.
 * Reference widths: red 60 · yellow 28 · cobalt 14 · pink 28 (130px total).
 * Components render these as flex ratios so the stripe scales edge-to-edge.
 */
export const posterStripe = {
  height: 4,
  segments: [
    { color: colors.red, width: 60 },
    { color: colors.yellow, width: 28 },
    { color: colors.cobalt, width: 14 },
    { color: colors.pink, width: 28 },
  ],
} as const;

/** Event-state surfaces: Past / Now / Next / Future. */
export const eventSurfaces = {
  past: {
    surface: colors.cream,
    opacity: 0.6,
    text: colors.gray,
    strike: true,
    border: colors.stroke,
  },
  now: {
    surface: colors.cobalt,
    text: colors.gold,
    body: colors.cream,
    border: colors.cobalt,
  },
  next: {
    surface: colors.yellow,
    text: colors.ink,
    border: colors.yellow,
  },
  future: {
    surface: colors.cream,
    text: colors.ink,
    border: colors.stroke,
  },
} as const;

export type EventState = keyof typeof eventSurfaces;

export const designTokens = {
  colors,
  eventTypes,
  personColors,
  personNames,
  typography,
  spacing,
  radii,
  shadows,
  posterStripe,
  eventSurfaces,
} as const;

export default designTokens;
