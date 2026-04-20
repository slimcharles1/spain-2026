"use client";

// Event Detail Modal — bottom sheet matching Pencil node `om2Wh`.
//
// Anatomy: handle + X, gradient hero (<Illustration />), type badge, time
// chip, title, 2 meta pills, description card, Pro Tip card (yellow),
// Location card (stylized faux map), ATTENDEES row, OPEN IN MAPS primary,
// 3 icon buttons (Share / Add to Cal / Edit).
//
// Opens via `useEventModal()` hook which listens to `window` 'open-event'
// CustomEvents. Dismiss via handle, X, scrim, Escape, or swipe-down.

import { useCallback, useEffect, useRef, useState } from "react";
import type { ScheduleEvent } from "@/lib/schedule-data";
import { PEOPLE, type PersonId } from "@/lib/expense-data";
import { downloadIcs } from "@/lib/ics";
import Illustration from "@/components/Illustration";

// Admin gate for the Edit button. Until a real persona system exists
// (NEG-67), fall back to Charles-as-admin via localStorage flag.
function isAdminPersona(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = localStorage.getItem("spain-persona");
    return p === null || p === "charles"; // default persona = Charles
  } catch {
    return true;
  }
}

const TYPE_LABEL: Record<ScheduleEvent["type"], string> = {
  travel: "TRAVEL",
  dining: "DINING",
  wine: "WINE",
  culture: "CULTURE",
  activity: "ACTIVITY",
  hotel: "HOTEL",
  sport: "SPORT",
  free: "FREE TIME",
};

interface Props {
  event: ScheduleEvent | null;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: Props) {
  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Escape to close
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [event, onClose]);

  // Body scroll lock while open
  useEffect(() => {
    if (!event) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [event]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) setDragY(dy);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (dragY > 120) {
      onClose();
    }
    setDragY(0);
    touchStartY.current = null;
  }, [dragY, onClose]);

  if (!event) return null;

  const location = event.location;
  const hasCoords = location?.lat != null && location?.lng != null;

  const openInMaps = () => {
    const url = hasCoords
      ? `https://maps.apple.com/?q=${location!.lat},${location!.lng}`
      : `https://maps.apple.com/?q=${encodeURIComponent(location?.query || location?.name || event.title)}`;
    window.open(url, "_blank");
  };

  const share = async () => {
    const shareData = {
      title: event.title,
      text: event.description,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    const nav = typeof navigator !== "undefined" ? navigator : null;
    try {
      if (nav && typeof nav.share === "function") {
        await nav.share(shareData);
        return;
      }
    } catch {
      // fall through to clipboard
    }
    try {
      if (nav?.clipboard) {
        await nav.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      }
    } catch {
      // best effort
    }
  };

  const addToCal = () => {
    downloadIcs({
      uid: event.id,
      title: event.title,
      description: event.description,
      location: location?.address || location?.name,
      date: event.date,
      time: event.time,
      durationMinutes: event.durationMinutes ?? 60,
    });
  };

  const edit = () => {
    if (!isAdminPersona()) return;
    // Route placeholder — real editor lands in a later ticket.
    window.location.href = `/schedule?edit=${encodeURIComponent(event.id)}`;
  };

  const attendees: PersonId[] = resolveAttendees(event);
  const endTime = event.endTime ?? computeEndTime(event.time, event.durationMinutes ?? 60);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      data-testid="event-detail-modal"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        data-testid="modal-scrim"
      />
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg rounded-t-3xl overflow-hidden animate-slide-up flex flex-col"
        style={{
          background: "#F5F1E8",
          maxHeight: "92vh",
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          border: "1px solid #1B2A4A",
        }}
      >
        {/* Handle row */}
        <div
          className="flex items-center justify-between px-4 pt-2"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div style={{ width: 28, height: 4 }} />
          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              aria-label="Drag to dismiss"
              data-testid="modal-handle"
              onClick={onClose}
              className="h-2 w-9 rounded-full"
              style={{ background: "#D0CCBE" }}
            />
          </div>
          <button
            type="button"
            aria-label="Close"
            data-testid="modal-close-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "#F5F1E8", border: "1px solid #E5DFD0", color: "#1B2A4A" }}
          >
            ×
          </button>
        </div>

        {/* Scroll region */}
        <div className="flex-1 overflow-y-auto px-5 pt-1" style={{ paddingBottom: 160 }}>
          <div className="flex flex-col gap-3">
            <Illustration type={event.type} />

            {/* Badge row */}
            <div className="flex items-center justify-between">
              <span
                className="px-3 py-1.5 rounded-xl"
                style={{
                  background: "#1E4D92",
                  color: "#F5F1E8",
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                }}
                data-testid="type-badge"
              >
                {TYPE_LABEL[event.type]}
              </span>
              <span
                className="px-3 py-1.5 rounded-xl"
                style={{
                  background: "#F5F1E8",
                  border: "1px solid #E5DFD0",
                  color: "#1B2A4A",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                }}
                data-testid="time-chip"
              >
                {event.time}
                {endTime ? ` – ${endTime}` : ""}
                {event.durationMinutes ? ` · ${event.durationMinutes} MIN` : ""}
              </span>
            </div>

            <h2
              className="text-[26px] leading-tight"
              style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "#1B2A4A" }}
              data-testid="event-title"
            >
              {event.title}
            </h2>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2" data-testid="meta-row">
              {location?.name ? (
                <span
                  className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5"
                  style={{ background: "#FFFFFF", border: "1px solid #E5DFD0", fontSize: 11, fontWeight: 600, color: "#1B2A4A" }}
                >
                  <span aria-hidden>📍</span>
                  {location.name}
                </span>
              ) : null}
              <span
                className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5"
                style={{ background: "#FFFFFF", border: "1px solid #E5DFD0", fontSize: 11, fontWeight: 600, color: "#1B2A4A" }}
              >
                <span aria-hidden>👥</span>
                {attendees.length === 4 ? "All 4" : `${attendees.length} going`}
              </span>
            </div>

            {/* Description */}
            <div
              className="rounded-xl p-3.5"
              style={{ background: "#FFFFFF", border: "1px solid #E5DFD0" }}
              data-testid="description-card"
            >
              <p className="text-[13px] leading-snug" style={{ color: "#1B2A4A", lineHeight: 1.45 }}>
                {event.description}
              </p>
            </div>

            {/* Pro Tip */}
            {event.tip ? (
              <div
                className="rounded-xl p-3 flex flex-col gap-1"
                style={{ background: "#FFD23F" }}
                data-testid="pro-tip-card"
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "#CC2E2C",
                  }}
                >
                  PRO TIP
                </p>
                <p className="text-[12px]" style={{ color: "#1B2A4A", lineHeight: 1.4 }}>
                  {event.tip}
                </p>
              </div>
            ) : null}

            {/* Location card */}
            {location ? (
              <div
                className="rounded-xl p-3.5 flex flex-col gap-2.5"
                style={{ background: "#FFFFFF", border: "1px solid #E5DFD0" }}
                data-testid="location-card"
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "#6B6B6B",
                  }}
                >
                  LOCATION
                </p>
                <FauxMap label={location.name} />
                <p className="text-[12px]" style={{ color: "#1B2A4A", lineHeight: 1.4 }}>
                  {location.address ?? location.query ?? location.name}
                </p>
              </div>
            ) : null}

            {/* Attendees */}
            <div className="flex flex-col gap-2.5" data-testid="attendees-row">
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "#6B6B6B",
                }}
              >
                ATTENDEES · {attendees.length} GOING
              </p>
              <div className="flex items-center gap-2.5">
                {attendees.map((id) => {
                  const p = PEOPLE.find((x) => x.id === id)!;
                  return (
                    <div
                      key={id}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: p.bg,
                        color: p.fg,
                        border: p.stroke ? `2px solid ${p.stroke}` : undefined,
                        fontFamily: "var(--font-display)",
                        fontSize: 10,
                      }}
                      title={p.name}
                    >
                      {p.initials}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div
          className="absolute left-0 right-0 bottom-0 flex flex-col gap-2.5 px-5 pt-3 pb-6"
          style={{
            background: "#F5F1E8",
            borderTop: "1px solid #E5DFD0",
          }}
        >
          <button
            type="button"
            onClick={openInMaps}
            data-testid="open-in-maps-btn"
            className="h-[54px] rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ background: "#CC2E2C" }}
          >
            <span aria-hidden style={{ color: "#FFD23F", fontSize: 16 }}>📍</span>
            <span
              style={{
                color: "#FFD23F",
                fontFamily: "var(--font-body)",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              OPEN IN MAPS
            </span>
          </button>

          <div className="flex items-center justify-center gap-4">
            <IconAction symbol="↗" label="Share" onClick={share} testId="share-btn" />
            <IconAction symbol="📅" label="Add to Cal" onClick={addToCal} testId="add-to-cal-btn" />
            <IconAction
              symbol="✎"
              label="Edit"
              onClick={edit}
              testId="edit-btn"
              disabled={!isAdminPersona()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconAction({
  symbol,
  label,
  onClick,
  testId,
  disabled,
}: {
  symbol: string;
  label: string;
  onClick: () => void;
  testId: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        data-testid={testId}
        disabled={disabled}
        aria-label={label}
        className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5DFD0",
          color: "#1B2A4A",
          fontSize: 16,
          opacity: disabled ? 0.35 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {symbol}
      </button>
      <span
        style={{ color: "#6B6B6B", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em" }}
      >
        {label}
      </span>
    </div>
  );
}

function FauxMap({ label }: { label: string }) {
  // Stylized faux map from Pencil `phAHt`. Decorative only.
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ height: 90, background: "#F5F1E8" }}
      data-testid="faux-map"
      aria-hidden="true"
    >
      <span className="absolute" style={{ left: 8, top: 8, width: 32, height: 22, background: "#D4D8D0" }} />
      <span className="absolute" style={{ left: 44, top: 12, width: 48, height: 18, background: "#DDE0D8" }} />
      <span className="absolute" style={{ left: 100, top: 10, width: 24, height: 28, background: "#D4D8D0" }} />
      <span className="absolute" style={{ left: 130, top: 40, width: 40, height: 20, background: "#DDE0D8" }} />
      <span className="absolute" style={{ left: 0, top: 40, width: "100%", height: 4, background: "#C8CBC3" }} />
      <span className="absolute" style={{ left: 92, top: 0, width: 3, height: "100%", background: "#C8CBC3" }} />
      <span
        className="absolute"
        style={{
          left: 160,
          top: 38,
          width: 14,
          height: 14,
          borderRadius: 999,
          background: "#CC2E2C",
          border: "2px solid #FFFFFF",
        }}
      />
      <span
        className="absolute"
        style={{
          left: 90,
          top: 70,
          fontFamily: "var(--font-display)",
          fontSize: 7,
          letterSpacing: "0.12em",
          color: "#6B6B6B",
        }}
      >
        {label.slice(0, 14).toUpperCase()}
      </span>
    </div>
  );
}

function computeEndTime(time: string, minutes: number): string | null {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hh, mm] = time.split(":").map(Number);
  const total = hh * 60 + mm + minutes;
  const eh = Math.floor((total % 1440) / 60);
  const em = total % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

function resolveAttendees(event: ScheduleEvent): PersonId[] {
  if (event.splitGroup === "guys") return ["charles", "tony"];
  if (event.splitGroup === "girls") return ["carly", "ang"];
  return ["charles", "carly", "tony", "ang"];
}
