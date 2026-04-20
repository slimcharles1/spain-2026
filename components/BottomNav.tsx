"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    // NEG-73: "Home" is now the landing page at /home, not the root dispatcher.
    href: "/home",
    label: "Home",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        )}
      </svg>
    ),
  },
  {
    // NEG-73: "Schedule" relabeled to "Today" to match design-system nav.
    href: "/schedule",
    label: "Today",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        )}
      </svg>
    ),
  },
  {
    href: "/bookings",
    label: "Bookings",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
    ),
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
    ),
  },
  {
    // NEG-72: "Info" destination. The current nav didn't have an Info tab, so
    // we're adding this one explicitly as "Info" and pointing it at /changes —
    // the Change of Plans log IS the trip info surface.
    href: "/changes",
    label: "Info",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide during onboarding screens.
  if (pathname === "/login" || pathname === "/persona") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "linear-gradient(180deg, rgba(255, 252, 245, 0.85) 0%, rgba(255, 252, 245, 0.98) 100%)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderTop: "1px solid rgba(212, 168, 67, 0.15)",
        boxShadow: "0 -4px 20px rgba(27, 42, 74, 0.04)",
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-1" style={{ paddingBottom: "env(safe-area-inset-bottom)", height: "calc(64px + env(safe-area-inset-bottom))" }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-0.5 py-2.5 w-[72px] transition-all duration-150"
              style={{
                color: active ? "var(--theme-nav-active)" : "var(--theme-nav-inactive)",
              }}
            >
              {active && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 24,
                  height: 3,
                  background: "linear-gradient(90deg, #C0392B, #D4A843)",
                  borderRadius: "0 0 4px 4px",
                }} />
              )}
              {tab.icon(active)}
              <span
                className="text-[11px] font-semibold tracking-wide transition-opacity duration-150"
                style={{ opacity: active ? 1 : 0.5 }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
