"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingItems, tierConfig, type BookingTier, type BookingItem } from "@/lib/booking-data";
import { getSupabase } from "@/lib/supabase";

interface BookingState {
  [id: string]: {
    checked: boolean;
    confirmation?: string;
  };
}

const STORAGE_KEY = "spain-bookings";

function loadBookings(): BookingState {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return {};
}

function saveBookings(state: BookingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingState>({});
  const [collapsedTiers, setCollapsedTiers] = useState<Set<BookingTier>>(new Set());
  const [animatingTier, setAnimatingTier] = useState<BookingTier | null>(null);
  const [confettiTier, setConfettiTier] = useState<BookingTier | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadBookings();
    setBookings(loaded);

    // Auto-collapse tiers that are already complete
    const tiers: BookingTier[] = ["book-now", "book-closer", "no-booking"];
    const autoCollapse = new Set<BookingTier>();
    for (const tier of tiers) {
      const tierItems = bookingItems.filter((b) => b.tier === tier);
      const allChecked = tierItems.every((b) => loaded[b.id]?.checked);
      if (allChecked) autoCollapse.add(tier);
    }
    setCollapsedTiers(autoCollapse);
  }, []);

  // Sync to Supabase
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    // Subscribe to realtime changes
    const channel = sb
      .channel("bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => {
        if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
          const row = payload.new as { id: string; checked: boolean; confirmation: string };
          setBookings((prev) => {
            const next = { ...prev, [row.id]: { checked: row.checked, confirmation: row.confirmation } };
            saveBookings(next);
            return next;
          });
        }
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, []);

  const toggleBooking = useCallback((item: BookingItem) => {
    setBookings((prev) => {
      const current = prev[item.id];
      const newChecked = !current?.checked;
      const next = { ...prev, [item.id]: { ...current, checked: newChecked } };
      saveBookings(next);

      // Sync to Supabase
      const sb = getSupabase();
      if (sb) {
        sb.from("bookings").upsert({ id: item.id, checked: newChecked, checked_at: new Date().toISOString() }).then(() => {});
      }

      // Check if tier is now complete
      if (newChecked) {
        const tierItems = bookingItems.filter((b) => b.tier === item.tier);
        const allChecked = tierItems.every((b) => (b.id === item.id ? true : next[b.id]?.checked));
        if (allChecked) {
          // Trigger confetti for book-now tier
          if (item.tier === "book-now") {
            setConfettiTier("book-now");
            setTimeout(() => setConfettiTier(null), 1500);
          }
          // Collapse after delay
          setAnimatingTier(item.tier);
          setTimeout(() => {
            setCollapsedTiers((prev) => new Set([...prev, item.tier]));
            setAnimatingTier(null);
          }, 1200);
        }
      } else {
        // Unchecking — expand the tier
        setCollapsedTiers((prev) => {
          const next = new Set(prev);
          next.delete(item.tier);
          return next;
        });
      }

      return next;
    });
  }, []);

  // Progress calculation — only count bookable items (exclude walk-ins)
  const bookableItems = bookingItems.filter((b) => b.tier !== "no-booking");
  const totalItems = bookableItems.length;
  const checkedCount = bookableItems.filter((b) => bookings[b.id]?.checked).length;
  const allComplete = checkedCount === totalItems;

  // Group items by tier, with completed tiers at bottom
  const tiers: BookingTier[] = ["book-now", "book-closer", "no-booking"];
  const incompleteTiers = tiers.filter((t) => !collapsedTiers.has(t));
  const completeTiers = tiers.filter((t) => collapsedTiers.has(t));
  const orderedTiers = [...incompleteTiers, ...completeTiers];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1
          className="text-[28px] leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
        >
          {allComplete ? "✓ You're all set" : "Bookings"}
        </h1>
        {allComplete ? (
          <p className="text-[14px] mt-1" style={{ color: "var(--theme-text-secondary)" }}>
            {totalItems} of {totalItems} bookings confirmed
          </p>
        ) : (
          <p className="text-[14px] mt-1" style={{ color: "var(--theme-text-secondary)" }}>
            {checkedCount} of {totalItems} ready
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(27, 42, 74, 0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(checkedCount / totalItems) * 100}%`,
              background: allComplete
                ? "#5D6D3F"
                : `linear-gradient(90deg, #C0392B, #D4A843, #5D6D3F)`,
            }}
          />
        </div>
      </div>

      {allComplete && (
        <p className="px-5 text-[14px] italic" style={{ color: "var(--theme-text-secondary)", opacity: 0.4 }}>
          Enjoy Spain — you&apos;ve earned it.
        </p>
      )}

      {/* Confetti overlay */}
      {confettiTier && <ConfettiBurst color={tierConfig[confettiTier].color} />}

      {/* Tiers */}
      <div className="px-5 py-4 space-y-4">
        {orderedTiers.map((tier) => {
          const config = tierConfig[tier];
          const items = bookingItems.filter((b) => b.tier === tier);
          const tierChecked = items.filter((b) => bookings[b.id]?.checked).length;
          const isCollapsed = collapsedTiers.has(tier);
          const isAnimating = animatingTier === tier;

          if (isCollapsed) {
            return (
              <button
                key={tier}
                onClick={() => setCollapsedTiers((prev) => {
                  const next = new Set(prev);
                  next.delete(tier);
                  return next;
                })}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98]"
                style={{
                  background: config.bgColor,
                  borderLeft: `3px solid ${config.color}`,
                }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: config.color }}>
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <span className="text-[14px] font-semibold" style={{ color: "var(--theme-text)" }}>
                    {config.label} ({tierChecked}/{items.length})
                  </span>
                  <span className="text-[13px] ml-2" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
                    All confirmed
                  </span>
                </div>
                <svg className="w-4 h-4" style={{ color: "var(--theme-text-secondary)", opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          }

          return (
            <div
              key={tier}
              className={`transition-all duration-400 ${isAnimating ? "opacity-50 scale-95" : ""}`}
            >
              {/* Tier header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: config.color }} />
                <h2 className="text-[13px] font-bold tracking-widest uppercase" style={{ color: config.color }}>
                  {config.label}
                </h2>
                <span className="text-[12px]" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
                  {config.sublabel}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {items.map((item) => {
                  const isChecked = bookings[item.id]?.checked ?? false;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl p-3.5 transition-all active:scale-[0.98] cursor-pointer"
                      style={{
                        background: "var(--theme-card, white)",
                        borderLeft: `3px solid ${config.color}`,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        opacity: isChecked ? 0.6 : 1,
                      }}
                      onClick={() => toggleBooking(item)}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${isChecked ? "animate-pop" : ""}`}
                        style={{
                          borderColor: isChecked ? config.color : "rgba(27, 42, 74, 0.2)",
                          background: isChecked ? config.color : "transparent",
                        }}
                      >
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-[14px] font-semibold ${isChecked ? "line-through" : ""}`}
                          style={{ color: "var(--theme-text)" }}
                        >
                          {item.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.dateLabel && (
                            <span className="text-[12px]" style={{ color: "var(--theme-text-secondary)" }}>
                              {item.dateLabel}
                            </span>
                          )}
                          {item.partySize && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(27, 42, 74, 0.05)", color: "var(--theme-text-secondary)" }}>
                              {item.partySize} people
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-[12px] mt-1" style={{ color: "var(--theme-text-secondary)", opacity: 0.7 }}>
                            {item.notes}
                          </p>
                        )}
                        {/* Confirmation number field — shown when checked */}
                        {isChecked && item.tier !== "no-booking" && (
                          <input
                            type="text"
                            placeholder="Confirmation #"
                            value={bookings[item.id]?.confirmation ?? ""}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBookings((prev) => {
                                const next = { ...prev, [item.id]: { ...prev[item.id], confirmation: val } };
                                saveBookings(next);
                                const sb = getSupabase();
                                if (sb) {
                                  sb.from("bookings").upsert({ id: item.id, checked: true, confirmation: val }).then(() => {});
                                }
                                return next;
                              });
                            }}
                            className="mt-2 w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
                            style={{
                              background: "rgba(27, 42, 74, 0.03)",
                              border: "1px solid rgba(27, 42, 74, 0.08)",
                              color: "var(--theme-text)",
                            }}
                          />
                        )}
                      </div>

                      {/* External link */}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Book ${item.title}`}
                          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                          style={{ background: "rgba(27, 42, 74, 0.05)" }}
                        >
                          <svg className="w-3.5 h-3.5" style={{ color: "var(--theme-text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}

                      {/* Urgency dot for unbooked book-now items */}
                      {tier === "book-now" && !isChecked && (
                        <div className="w-2 h-2 rounded-full animate-pulse shrink-0 mt-2" style={{ background: config.color }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple CSS confetti burst component
function ConfettiBurst({ color }: { color: string }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: 40 + Math.random() * 20,
    delay: Math.random() * 0.3,
    duration: 0.6 + Math.random() * 0.4,
    angle: (i / 16) * 360,
    distance: 60 + Math.random() * 80,
    size: 4 + Math.random() * 4,
    color: i % 3 === 0 ? color : i % 3 === 1 ? "#D4A843" : "#1B2A4A",
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: "30%",
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
            transform: `rotate(${p.angle}deg)`,
          }}
        />
      ))}
    </div>
  );
}
