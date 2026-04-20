"use client";

// Lightweight placeholder for the `<Illustration type={event.type} />`
// primitive that NEG-64 is delivering. Renders a warm gradient + emoji to
// match the Pencil Hero node (`l4FLU` in om2Wh) until the real component
// lands and we can swap imports over to `@/components/design-system`.

import type { ScheduleEvent } from "@/lib/schedule-data";

type EventType = ScheduleEvent["type"];

const EMOJI: Record<EventType, string> = {
  travel: "✈️",
  dining: "🍽️",
  wine: "🍷",
  culture: "🏛️",
  activity: "🗺️",
  hotel: "🏨",
  sport: "⚽",
  free: "🌿",
};

const GRADIENTS: Record<EventType, [string, string]> = {
  travel: ["#EFE7F7", "#8D7CC3"],
  dining: ["#FCEDD8", "#E3A85C"],
  wine: ["#F8E7E7", "#B54A4A"],
  culture: ["#EAE2F4", "#9B7BB8"],
  activity: ["#E8F1E4", "#6A9A5A"],
  hotel: ["#E7EEF7", "#6A8FBF"],
  sport: ["#E9F0F7", "#3B5A82"],
  free: ["#F0EEE0", "#A9A470"],
};

interface Props {
  type: EventType;
  className?: string;
}

export default function Illustration({ type, className }: Props) {
  const [from, to] = GRADIENTS[type] ?? GRADIENTS.activity;
  return (
    <div
      data-testid="illustration"
      data-illustration-type={type}
      className={`relative w-full h-[140px] rounded-2xl overflow-hidden flex items-center justify-center ${className ?? ""}`}
      style={{ background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)` }}
    >
      {/* Confetti dots from Pencil Hero (qo3BE / olzA4 / spPfs) */}
      <span className="absolute w-3.5 h-3.5 rounded-full" style={{ top: 22, left: 24, background: "#FFD23F" }} />
      <span className="absolute w-2.5 h-2.5 rounded-full" style={{ top: 30, right: 20, background: "#CC2E2C" }} />
      <span className="absolute w-2 h-2 rounded-full" style={{ bottom: 12, left: 60, background: "#FF3E7F" }} />
      <span className="text-[64px] leading-none" aria-hidden="true">
        {EMOJI[type] ?? "✨"}
      </span>
    </div>
  );
}
