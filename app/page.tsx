"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { tripDays } from "@/lib/schedule-data";
import { bookingItems } from "@/lib/booking-data";
import {
  getTripPhase,
  getTripDayNumber,
  getCurrentCity,
  getCurrentHotel,
  daysUntilTrip,
  getNowAndNext,
  formatTimeDelta,
  useSpainTime,
} from "@/lib/time-utils";
import AppleMapsButton from "@/components/AppleMapsButton";
import InfoModal from "@/components/InfoModal";
import TonyBirthdayModal from "@/components/TonyBirthdayModal";

export default function Home() {
  const [phase, setPhase] = useState<"pre" | "during" | "post">("pre");
  const [showInfo, setShowInfo] = useState(false);
  const spainTime = useSpainTime();

  useEffect(() => {
    setPhase(getTripPhase());
  }, [spainTime]);

  const dayNum = getTripDayNumber();
  const city = getCurrentCity();
  const hotel = getCurrentHotel();
  const day = dayNum ? tripDays.find((d) => d.dayNumber === dayNum) : null;
  const { now: nowEvent, next: nextEvent, minutesUntilNext, minutesIntoNow, nowDurationMinutes } = dayNum
    ? getNowAndNext(dayNum)
    : { now: null, next: null, minutesUntilNext: null, minutesIntoNow: null, nowDurationMinutes: null };

  // Booking progress — only count bookable items (exclude walk-ins)
  const bookableItems = bookingItems.filter((b) => b.tier !== "no-booking");
  const [bookedCount, setBookedCount] = useState(0);
  useEffect(() => {
    const stored = localStorage.getItem("spain-bookings");
    const state = stored ? JSON.parse(stored) : {};
    const bookable = bookingItems.filter((b) => b.tier !== "no-booking");
    setBookedCount(bookable.filter((b) => state[b.id]?.checked).length);
  }, []);

  return (
    <div className="min-h-screen animate-fade-in azulejo-bg">
      {/* Gear icon for info */}
      <button
        onClick={() => setShowInfo(true)}
        className="fixed top-14 right-5 z-30 w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        style={{ background: "rgba(27, 42, 74, 0.06)" }}
        aria-label="Trip info"
      >
        <svg className="w-[18px] h-[18px]" style={{ color: "var(--theme-text)", opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Tony Birthday Modal */}
      <TonyBirthdayModal />

      {phase === "pre" && <PreTripView bookedCount={bookedCount} totalBookings={bookableItems.length} />}
      {phase === "during" && (
        <DuringTripView
          day={day}
          dayNum={dayNum}
          city={city}
          hotel={hotel}
          nowEvent={nowEvent}
          nextEvent={nextEvent}
          minutesUntilNext={minutesUntilNext}
          minutesIntoNow={minutesIntoNow}
          nowDurationMinutes={nowDurationMinutes}
          spainTime={spainTime}
        />
      )}
      {phase === "post" && <PostTripView />}

      <InfoModal open={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}

function PreTripView({ bookedCount, totalBookings }: { bookedCount: number; totalBookings: number }) {
  const days = daysUntilTrip();

  return (
    <div className="px-5 pt-16 pb-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1
          className="text-[48px] tracking-wider leading-none"
          style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
        >
          SPAIN
        </h1>
        <div className="h-1.5 w-32 mx-auto mt-2 rounded-full" style={{ background: "linear-gradient(90deg, #C0392B, #D4A843, #5D6D3F)" }} />
        <p className="text-[14px] mt-3" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text-secondary)" }}>
          Madrid & Seville
        </p>
        <p className="text-[12px] mt-1 tracking-widest uppercase" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
          May 15 – 22, 2026
        </p>

        {/* Travelers */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(27, 42, 74, 0.08)", color: "#1B2A4A" }}>
            Charles & Carly
          </span>
          <span style={{ color: "var(--theme-text-secondary)", opacity: 0.3 }}>&</span>
          <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(192, 57, 43, 0.08)", color: "#C0392B" }}>
            Tony & Ang
          </span>
        </div>
      </div>

      {/* Countdown — horseshoe arch silhouette */}
      <div className="text-center mb-8">
        <div
          className="inline-flex flex-col items-center justify-center w-32 h-36 relative"
          style={{
            background: "linear-gradient(180deg, rgba(192, 57, 43, 0.06) 0%, transparent 60%)",
            borderRadius: "50% 50% 16px 16px / 60% 60% 16px 16px",
            border: "2px solid rgba(192, 57, 43, 0.12)",
            borderBottom: "2px solid rgba(212, 168, 67, 0.15)",
          }}
        >
          <span className="text-[36px] font-bold block" style={{ color: "var(--theme-text)", fontFamily: "var(--font-mono)" }}>
            {days}
          </span>
          <span className="text-[11px] tracking-wider uppercase" style={{ color: "var(--theme-text-secondary)" }}>
            days to go
          </span>
        </div>
      </div>

      {/* Booking progress */}
      <Link
        href="/bookings"
        className="block p-4 mb-4 active:scale-[0.98] transition-transform card-featured"
      >
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold" style={{ color: "var(--theme-text)" }}>
            Bookings
          </span>
          <span className="text-[13px]" style={{ color: "var(--theme-text-secondary)" }}>
            {bookedCount} of {totalBookings}
          </span>
        </div>
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(27, 42, 74, 0.06)" }}>
          <div
            className="h-full rounded-full animate-grow"
            style={{
              width: `${(bookedCount / totalBookings) * 100}%`,
              background: "linear-gradient(90deg, #C0392B, #D4A843)",
            }}
          />
        </div>
      </Link>

      <div className="divider-spanish"><div className="divider-spanish-dot" /></div>

      {/* Section cards */}
      <div className="space-y-3 mb-8">
        {[
          { href: "/schedule", emoji: "📅", title: "Schedule", desc: "7 days, city by city" },
          { href: "/expenses", emoji: "💶", title: "Expenses", desc: "Track & split between couples" },
        ].map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-3.5 p-4 active:scale-[0.98] transition-transform card-spanish"
          >
            <span className="text-2xl">{s.emoji}</span>
            <div className="flex-1">
              <span className="text-[14px] font-semibold block" style={{ color: "var(--theme-text)" }}>{s.title}</span>
              <span className="text-[12px]" style={{ color: "var(--theme-text-secondary)" }}>{s.desc}</span>
            </div>
            <svg className="w-4 h-4 shrink-0" style={{ color: "var(--theme-text-secondary)", opacity: 0.2 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Trip at a Glance */}
      <div className="mb-8">
        <h2 className="section-masthead mb-3">
          The Week Ahead
        </h2>
        <div className="space-y-2">
          {tripDays.map((day) => (
            <Link
              key={day.dayNumber}
              href={`/schedule?day=${day.dayNumber}`}
              className="flex items-center gap-3 p-3 active:scale-[0.98] transition-transform stagger-item card-spanish"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: "rgba(27, 42, 74, 0.04)" }}
              >
                {day.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: "var(--theme-text)" }}>
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
                    {day.weekday}
                  </span>
                </div>
                <p className="text-[12px] truncate" style={{ color: "var(--theme-text-secondary)" }}>
                  {day.city} — {day.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div className="mb-8">
        <h2 className="section-masthead mb-3">
          May Weather
        </h2>
        <div className="flex gap-3">
          {[
            { city: "Madrid", high: "77°F", low: "60°F", icon: "🌤", note: "Warm, dry, occasional clouds" },
            { city: "Seville", high: "86°F", low: "65°F", icon: "☀️", note: "Hot and sunny, bring sunscreen" },
          ].map((w) => (
            <div
              key={w.city}
              className="flex-1 p-3.5 rounded-xl"
              style={{
                background: "var(--theme-card)",
                border: "1px solid var(--theme-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{w.icon}</span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--theme-text)" }}>{w.city}</span>
              </div>
              <div className="text-[20px] font-bold" style={{ color: "var(--theme-text)", fontFamily: "var(--font-mono)" }}>
                {w.high}
              </div>
              <div className="text-[11px]" style={{ color: "var(--theme-text-secondary)" }}>
                Low {w.low}
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: "var(--theme-text-secondary)", opacity: 0.7 }}>
                {w.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Hotels */}
      <div className="mb-8">
        <h2 className="section-masthead mb-3">
          Where You&apos;re Staying
        </h2>
        <div className="space-y-2">
          {[
            { name: "URSO Hotel & Spa", nights: "1 night", dates: "May 16", city: "Madrid", vibe: "1920s palace boutique" },
            { name: "Colón Gran Meliá", nights: "3 nights", dates: "May 17–19", city: "Seville", vibe: "Grand Seville landmark, FHR perks" },
            { name: "Gran Hotel Inglés", nights: "2 nights", dates: "May 20–21", city: "Madrid", vibe: "Historic luxury in Barrio de las Letras" },
          ].map((h) => (
            <div
              key={h.name}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "var(--theme-card)",
                border: "1px solid var(--theme-border)",
              }}
            >
              <span className="text-lg">🏨</span>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold block" style={{ color: "var(--theme-text)" }}>
                  {h.name}
                </span>
                <span className="text-[11px]" style={{ color: "var(--theme-text-secondary)" }}>
                  {h.nights} · {h.dates} · {h.city}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Phrases */}
      <div className="mb-8">
        <h2 className="section-masthead mb-3">
          Spanish Essentials
        </h2>
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: "var(--theme-card)",
            border: "1px solid var(--theme-border)",
          }}
        >
          {[
            { es: "La cuenta, por favor", en: "The check, please" },
            { es: "Ponme una caña", en: "A small draft beer" },
            { es: "Vale", en: "OK / sure / got it" },
            { es: "Perdona", en: "Excuse me (casual)" },
            { es: "¡Salud!", en: "Cheers!" },
          ].map((p) => (
            <div key={p.es} className="flex items-baseline justify-between gap-4">
              <span className="text-[14px] font-semibold" style={{ color: "var(--theme-text)" }}>
                {p.es}
              </span>
              <span className="text-[12px] shrink-0" style={{ color: "var(--theme-text-secondary)" }}>
                {p.en}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Tips */}
      <div className="mb-8">
        <h2 className="section-masthead mb-3">
          Know Before You Go
        </h2>
        <div className="space-y-2">
          {[
            { icon: "🍽", text: "Dinner starts at 9 PM. Restaurants won't be full until 10." },
            { icon: "😴", text: "Siesta is real — many shops close 2-5 PM." },
            { icon: "💳", text: "Cards accepted almost everywhere. Cash for small bars." },
            { icon: "🚕", text: "Flat-rate taxi from Madrid airport: €33." },
            { icon: "⚽", text: "Day 2: Real Madrid match + Tony's birthday!" },
          ].map((t) => (
            <div
              key={t.text}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: "var(--theme-card)",
                border: "1px solid var(--theme-border)",
              }}
            >
              <span className="text-base mt-0.5">{t.icon}</span>
              <span className="text-[13px] leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>
                {t.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-center mt-8" style={{ color: "var(--theme-text-secondary)", opacity: 0.2 }}>
        built by negative space llc
      </p>
    </div>
  );
}

function DuringTripView({
  day, dayNum, city, hotel, nowEvent, nextEvent, minutesUntilNext, minutesIntoNow, nowDurationMinutes, spainTime,
}: {
  day: (typeof tripDays)[0] | null | undefined;
  dayNum: number | null;
  city: string | null;
  hotel: ReturnType<typeof getCurrentHotel>;
  nowEvent: ReturnType<typeof getNowAndNext>["now"];
  nextEvent: ReturnType<typeof getNowAndNext>["next"];
  minutesUntilNext: number | null;
  minutesIntoNow: number | null;
  nowDurationMinutes: number | null;
  spainTime: string;
}) {
  return (
    <div className="px-5 pt-12 pb-8">
      {/* City banner */}
      <div
        className="rounded-2xl p-5 mb-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #2d4a7a 100%)",
          minHeight: 140,
        }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%)`,
          backgroundSize: "20px 20px",
        }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-widest uppercase text-white/50">
            {day ? `Day ${day.dayNumber} of 7` : "Spain 2026"}
          </p>
          <h1 className="text-[28px] text-white mt-1 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            {city ? `You're in ${city}` : "Spain 2026"}
          </h1>
          <p className="text-[13px] text-white/60 mt-1">
            {day?.weekday}, {day?.date.split("-").reverse().join("/")}
          </p>
          {spainTime && (
            <p className="text-[12px] text-white/40 mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
              Spain time: {(() => {
                const [h, m] = spainTime.split(":").map(Number);
                const ampm = h >= 12 ? "PM" : "AM";
                const hour = h % 12 || 12;
                return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
              })()}
            </p>
          )}
          {hotel && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[12px] text-white/50">🏨</span>
              <span className="text-[12px] text-white/70">{hotel.name}</span>
              <AppleMapsButton
                location={{ name: hotel.name, address: hotel.address, query: hotel.mapsQuery }}
                variant="pill"
              />
            </div>
          )}
        </div>
      </div>

      {/* Happening Now */}
      {nowEvent && (
        <div
          className="rounded-2xl p-4 mb-3"
          style={{
            background: "var(--theme-card)",
            borderLeft: "3px solid #C0392B",
            boxShadow: "0 1px 8px rgba(192, 57, 43, 0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded text-white" style={{ background: "#C0392B" }}>
              NOW
            </span>
            {minutesIntoNow !== null && nowDurationMinutes !== null && (
              <span className="text-[12px]" style={{ color: "var(--theme-text-secondary)" }}>
                {Math.max(0, nowDurationMinutes - minutesIntoNow)} min left
              </span>
            )}
          </div>
          <h3 className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
            {nowEvent.title}
          </h3>
          {nowEvent.location && (
            <div className="mt-2">
              <AppleMapsButton location={nowEvent.location} variant="pill" />
            </div>
          )}
          {minutesIntoNow !== null && nowDurationMinutes !== null && (
            <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(192, 57, 43, 0.1)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (minutesIntoNow / nowDurationMinutes) * 100)}%`,
                  background: "#C0392B",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Up Next */}
      {nextEvent && (
        <Link
          href="/schedule"
          className="block rounded-2xl p-4 mb-3 active:scale-[0.98] transition-transform"
          style={{
            background: "var(--theme-card)",
            borderLeft: "3px solid #D4A843",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: "#D4A843", color: "#1B2A4A" }}>
              NEXT
            </span>
            {minutesUntilNext !== null && (
              <span className="text-[12px] font-semibold" style={{ color: "#D4A843" }}>
                {formatTimeDelta(minutesUntilNext)}
              </span>
            )}
          </div>
          <h3 className="text-[16px] font-semibold" style={{ color: "var(--theme-text)" }}>
            {nextEvent.title}
          </h3>
          {nextEvent.location && (
            <div className="mt-2">
              <AppleMapsButton location={nextEvent.location} variant="pill" />
            </div>
          )}
        </Link>
      )}

      {/* Today's remaining */}
      {day && (
        <div className="mt-4">
          <h2 className="section-masthead mb-3">
            Today&apos;s Schedule
          </h2>
          <Link href="/schedule" className="space-y-1 block">
            {day.events.slice(0, 6).map((event) => {
              const [h, m] = event.time.split(":").map(Number);
              const ampm = h >= 12 ? "p" : "a";
              const hour = h % 12 || 12;
              return (
                <div key={event.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-[12px] w-14 shrink-0" style={{ color: "var(--theme-text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {hour}:{m.toString().padStart(2, "0")}{ampm}
                  </span>
                  <span className="text-[14px] truncate" style={{ color: "var(--theme-text)" }}>
                    {event.title}
                  </span>
                </div>
              );
            })}
            {day.events.length > 6 && (
              <p className="text-[12px] pt-1" style={{ color: "var(--theme-accent, #C0392B)" }}>
                +{day.events.length - 6} more →
              </p>
            )}
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3 mt-6">
        <Link
          href="/expenses"
          className="flex-1 p-3.5 rounded-2xl text-center active:scale-[0.98] transition-transform"
          style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)" }}
        >
          <span className="text-lg block">💶</span>
          <span className="text-[12px] font-semibold" style={{ color: "var(--theme-text)" }}>Add Expense</span>
        </Link>
        <Link
          href="/bookings"
          className="flex-1 p-3.5 rounded-2xl text-center active:scale-[0.98] transition-transform"
          style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)" }}
        >
          <span className="text-lg block">✅</span>
          <span className="text-[12px] font-semibold" style={{ color: "var(--theme-text)" }}>Bookings</span>
        </Link>
      </div>
    </div>
  );
}

function PostTripView() {
  return (
    <div className="px-5 pt-16 pb-8 text-center">
      <h1 className="text-[28px]" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
        Memories from Spain
      </h1>
      <p className="text-[14px] mt-2" style={{ color: "var(--theme-text-secondary)" }}>
        What an incredible trip. Check expenses for the final settlement.
      </p>
      <div className="mt-6">
        <Link
          href="/expenses"
          className="inline-block px-6 py-3 rounded-xl text-[14px] font-semibold text-white"
          style={{ background: "#C0392B" }}
        >
          View Expenses
        </Link>
      </div>
    </div>
  );
}
