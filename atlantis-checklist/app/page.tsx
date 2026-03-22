"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { trackClick } from "@/lib/analytics";

const RICK_ROLL_GIF = "https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif";
// "It's a trap!" Admiral Ackbar — works as a gotcha
const GOTCHA_GIF = "https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif";

const sections = [
  {
    href: "/checklist",
    emoji: "✅",
    title: "Packing List",
    description: "Track what's packed for the Charly crew",
    color: "from-mint/20 to-emerald-500/10",
    border: "border-mint/20",
  },
  {
    href: "/expenses",
    emoji: "💰",
    title: "Master Tab",
    description: "Log expenses & split between Charly and Ganks",
    color: "from-coral/20 to-pink/10",
    border: "border-coral/20",
  },
  {
    href: "/schedule",
    emoji: "📅",
    title: "Schedule",
    description: "Day-by-day itinerary, reservations & plans",
    color: "from-gold/20 to-amber-500/10",
    border: "border-gold/20",
  },
  {
    href: "/guide",
    emoji: "🗺️",
    title: "Guide & Map",
    description: "Tips, dining, directions & interactive map",
    color: "from-sky-400/20 to-blue-500/10",
    border: "border-sky-400/20",
  },
];

export default function Home() {
  const [showConcierge, setShowConcierge] = useState(false);
  const [conciergePhase, setConciergePhase] = useState<"loading" | "reveal" | "gotcha">("loading");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Transition from loading to reveal after delay
  useEffect(() => {
    if (showConcierge && conciergePhase === "loading") {
      const timer = setTimeout(() => setConciergePhase("reveal"), 2200);
      return () => clearTimeout(timer);
    }
  }, [showConcierge, conciergePhase]);

  // When reveal phase starts, unmute the audio
  useEffect(() => {
    if (conciergePhase === "reveal" && audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = 1;
    }
  }, [conciergePhase]);

  const openConcierge = () => {
    trackClick("concierge_button");
    setConciergePhase("loading");
    setShowConcierge(true);

    // iOS requires audio.play() in the SAME synchronous call stack as the user gesture.
    // Start playing immediately (muted) so iOS unlocks the audio context,
    // then unmute when the reveal phase kicks in.
    try {
      const audio = document.createElement("audio");
      // Local file — no CORS issues
      audio.src = "/rickroll.mp3";
      audio.loop = true;
      audio.muted = true; // Start muted to satisfy autoplay policy
      audio.setAttribute("playsinline", "");
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {}
  };

  const closeConcierge = useCallback(() => {
    setShowConcierge(false);
    setConciergePhase("loading");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  const goToGotcha = useCallback(() => {
    setConciergePhase("gotcha");
  }, []);

  return (
    <div className="min-h-screen font-body">
      {/* Hero image */}
      <div className="relative h-44 overflow-hidden">
        <img src="/headers/home.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-950/40 via-ocean-950/20 to-ocean-950" />
      </div>

      {/* Hero text */}
      <div className="px-5 -mt-8 pb-6 text-center relative z-10">
        <h1 className="font-display text-4xl sm:text-5xl bg-gradient-to-r from-gold via-coral to-pink bg-clip-text text-transparent leading-tight">
          Atlantis Bahamas
        </h1>
        <p className="text-white/40 text-lg mt-2 font-display">2026</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="bg-coral/15 text-coral text-xs font-bold px-3 py-1 rounded-full">
            Charly
          </span>
          <span className="text-white/20">&amp;</span>
          <span className="bg-gold/15 text-gold text-xs font-bold px-3 py-1 rounded-full">
            Ganks
          </span>
        </div>
        <p className="text-white/25 text-xs mt-3">
          The Reef at Atlantis · Paradise Island
        </p>
      </div>

      {/* Section cards */}
      <div className="px-4 space-y-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`block bg-gradient-to-r ${s.color} rounded-2xl p-4 border ${s.border} hover:scale-[1.01] active:scale-[0.99] transition-transform`}
          >
            <div className="flex items-center gap-3.5">
              <div className="text-3xl">{s.emoji}</div>
              <div>
                <div className="text-white font-semibold text-sm">
                  {s.title}
                </div>
                <div className="text-white/40 text-xs mt-0.5">
                  {s.description}
                </div>
              </div>
              <svg
                className="w-4 h-4 text-white/20 ml-auto flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Concierge button (easter egg) */}
      <div className="px-4 mt-8 mb-6">
        <button
          onClick={openConcierge}
          className="w-full bg-ocean-800/80 border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:bg-ocean-700/60 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-white text-sm font-semibold">
              Atlantis Concierge
            </div>
            <div className="text-white/40 text-xs">
              Chat with resort staff for help
            </div>
          </div>
          <div className="ml-auto flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          </div>
        </button>
      </div>

      <p className="text-white/10 text-xs text-center pb-4">
        built by negative space llc
      </p>

      {/* Concierge / Rick Roll modal */}
      {showConcierge && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-6"
          onClick={closeConcierge}
        >
          <div
            className="bg-ocean-800 rounded-2xl p-5 max-w-sm w-full border border-white/10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {conciergePhase === "gotcha" ? (
              <>
                <img
                  src={GOTCHA_GIF}
                  alt="It's a trap!"
                  className="w-full rounded-xl mb-4"
                />
                <h3 className="font-display text-xl text-white mb-2">
                  Really? That gullible?
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  You clicked &ldquo;I deserved that&rdquo; and thought it was over? 💀
                </p>
                <div className="bg-white/5 rounded-xl p-3 mb-4">
                  <p className="text-white/40 text-xs italic">
                    &ldquo;The concierge desk is currently closed. Please try again never.&rdquo;
                  </p>
                  <p className="text-white/20 text-[10px] mt-2">
                    — Atlantis Management (not really)
                  </p>
                </div>
                <button
                  onClick={closeConcierge}
                  className="w-full py-2.5 rounded-xl bg-coral/20 text-coral text-sm font-medium hover:bg-coral/30 transition-colors"
                >
                  OK I&apos;m done 💀
                </button>
              </>
            ) : conciergePhase === "loading" ? (
              <>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg text-white mb-2">
                  Connecting to Atlantis Concierge...
                </h3>
                <div className="flex justify-center gap-1.5 mb-4">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-white/30 text-xs">
                  Reaching a Paradise Island representative...
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">🐟</div>
                <h3 className="font-display text-xl text-white mb-1">
                  You&apos;ve been reef-rolled!
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Never gonna give you up, never gonna let you drown...
                </p>
                <img
                  src={RICK_ROLL_GIF}
                  alt="Rick Astley dancing"
                  className="w-full rounded-xl mb-4"
                />
                <button
                  onClick={goToGotcha}
                  className="w-full py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  I deserved that 🤣
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
