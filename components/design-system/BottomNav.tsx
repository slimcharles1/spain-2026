"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors, radii } from "@/lib/design-tokens";

/**
 * BottomNav — pill tab bar with 4 tabs (Today / Bookings / Expenses / Info).
 * Active route gets cobalt pill + cream text; inactive gets ink on transparent.
 * English-only chrome (no Spanish in tab labels).
 */
export interface BottomNavTab {
  href: string;
  label: string;
}

export interface BottomNavProps {
  /** Override tabs for testing / alternate layouts. */
  tabs?: BottomNavTab[];
  /** Manual active override (otherwise derived from pathname). */
  activeHref?: string;
}

export const DEFAULT_TABS: BottomNavTab[] = [
  { href: "/today", label: "Today" },
  { href: "/bookings", label: "Bookings" },
  { href: "/expenses", label: "Expenses" },
  // NEG-72: Info tab points at /changes — the Change of Plans log is the
  // trip's info surface. Keep the label "Info" so consumers don't break.
  { href: "/changes", label: "Info" },
];

export function BottomNav({ tabs = DEFAULT_TABS, activeHref }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      data-testid="bottom-nav"
      aria-label="Primary"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        background: colors.cream,
        borderTop: `1px solid ${colors.stroke}`,
        zIndex: 50,
        fontFamily: "var(--font-lm-body)",
      }}
    >
      <ul
        style={{
          display: "flex",
          gap: 8,
          padding: 4,
          background: colors.white,
          borderRadius: radii.pill,
          border: `1px solid ${colors.stroke}`,
          listStyle: "none",
          margin: 0,
        }}
      >
        {tabs.map((tab) => {
          const active = activeHref
            ? tab.href === activeHref
            : pathname === tab.href || (tab.href !== "/" && !!pathname?.startsWith(tab.href));

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                data-testid={`bottom-nav-tab-${tab.label.toLowerCase()}`}
                data-active={active ? "true" : "false"}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: radii.pill,
                  fontSize: 14,
                  fontWeight: active ? 700 : 600,
                  color: active ? colors.cream : colors.ink,
                  background: active ? colors.cobalt : "transparent",
                  textDecoration: "none",
                  transition: "background 120ms ease, color 120ms ease",
                }}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
