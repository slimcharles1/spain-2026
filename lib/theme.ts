export interface ThemeColors {
  bg: string;
  card: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentSecondary: string;
  border: string;
  navBg: string;
  navActive: string;
  navInactive: string;
}

export const spanishTheme: ThemeColors = {
  bg: "#FFFDF7",
  card: "#FFFFFF",
  text: "#1B2A4A",
  textSecondary: "#666666",
  accent: "#C0392B",
  accentSecondary: "#D4A843",
  border: "rgba(27, 42, 74, 0.08)",
  navBg: "#FFFDF7",
  navActive: "#1B2A4A",
  navInactive: "rgba(27, 42, 74, 0.35)",
};

export const realMadridTheme: ThemeColors = {
  bg: "#0A1128",
  card: "#0F1A3D",
  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.6)",
  accent: "#FEBE10",
  accentSecondary: "#FEBE10",
  border: "rgba(254, 190, 16, 0.1)",
  navBg: "#0A1128",
  navActive: "#FEBE10",
  navInactive: "rgba(255, 255, 255, 0.35)",
};

// Day 2 = May 17, 2026 (Sunday) — Real Madrid theme on Schedule + Home
export function isRealMadridDay(): boolean {
  const now = new Date();
  const spainDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return spainDate === "2026-05-17";
}

// Tony's birthday is also May 17
export function isTonysBirthday(): boolean {
  return isRealMadridDay();
}
