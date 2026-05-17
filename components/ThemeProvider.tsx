"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeMode = "default" | "real-madrid";

const ThemeContext = createContext<{
  theme: ThemeMode;
  setThemeOverride: (theme: ThemeMode | null) => void;
}>({
  theme: "default",
  setThemeOverride: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("default");
  const [override, setOverride] = useState<ThemeMode | null>(null);

  useEffect(() => {
    // Check if today is Day 2 (May 17) in Spain timezone
    const checkDate = () => {
      const spainDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Madrid",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      if (spainDate === "2026-05-17") {
        setTheme("real-madrid");
      } else {
        setTheme("default");
      }
    };

    checkDate();
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeTheme = override ?? theme;

  // Toggle the theme class on <html> so it cascades to <body>'s background
  // and every descendant — not just an inner wrapper div.
  useEffect(() => {
    const root = document.documentElement;
    if (activeTheme === "real-madrid") {
      root.classList.add("theme-real-madrid");
    } else {
      root.classList.remove("theme-real-madrid");
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, setThemeOverride: setOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}
