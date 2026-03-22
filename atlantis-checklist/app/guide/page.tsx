"use client";

import { useState } from "react";
import { guideSections } from "@/lib/guide-data";

export default function GuidePage() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [tapCount, setTapCount] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [showRickRoll, setShowRickRoll] = useState(false);

  const handleTitleTap = () => {
    const now = Date.now();
    if (now - lastTap < 500) {
      const next = tapCount + 1;
      setTapCount(next);
      if (next >= 5) {
        setShowRickRoll(true);
        setTapCount(0);
      }
    } else {
      setTapCount(1);
    }
    setLastTap(now);
  };

  return (
    <div className="min-h-screen font-body">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-ocean-950 to-ocean-900 pb-4 shadow-lg shadow-ocean-950/50">
        <div className="px-5 pt-10 pb-2 text-center">
          <h1
            onClick={handleTitleTap}
            className="font-display text-3xl bg-gradient-to-r from-gold via-coral to-pink bg-clip-text text-transparent cursor-default select-none"
          >
            Atlantis Guide
          </h1>
          <p className="text-white/50 text-sm mt-1 tracking-wide">
            Tips for The Reef — with toddlers in tow
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 py-4 space-y-3">
        {guideSections.map((section) => {
          const isCollapsed = collapsed[section.id] ?? false;
          return (
            <div
              key={section.id}
              className="bg-ocean-800/60 backdrop-blur rounded-2xl overflow-hidden border border-white/5"
            >
              <button
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [section.id]: !isCollapsed,
                  }))
                }
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{section.emoji}</span>
                  <span className="text-white font-semibold text-sm">
                    {section.title}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-white/40 transition-transform ${
                    isCollapsed ? "" : "rotate-180"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {!isCollapsed && (
                <div className="px-4 pb-4 space-y-2.5">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 text-sm"
                    >
                      <span className="text-mint/60 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-white/70 leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 pb-6 pt-2">
        <p className="text-white/15 text-xs text-center">
          Have a great trip, Charly &amp; Ganks! 🌊
        </p>
      </div>

      {/* Rick Roll Easter Egg */}
      {showRickRoll && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-6"
          onClick={() => setShowRickRoll(false)}
        >
          <div
            className="bg-ocean-800 rounded-2xl p-5 max-w-sm w-full border border-white/10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">🐟</div>
            <h3 className="font-display text-xl text-white mb-1">
              You&apos;ve been reef-rolled!
            </h3>
            <p className="text-white/50 text-sm mb-4">
              Never gonna give you up, never gonna let you drown...
            </p>
            <div className="rounded-xl overflow-hidden mb-4 aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=0"
                title="reef-rolled"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
            <button
              onClick={() => setShowRickRoll(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-colors"
            >
              I deserved that 🤣
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
