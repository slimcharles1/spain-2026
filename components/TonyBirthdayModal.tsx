"use client";

import { useState, useEffect, useCallback } from "react";

const jokes = [
  "Your 2027 Porsche Cayenne is ready for pickup...\njust kidding. Happy birthday. 🚗",
  "For the man who has every watch\nbut still can't be on time. ⌚",
  "Tony would say:\n\"This hotel minibar is a scam.\nHappy birthday to me.\" 💀",
  "From Charles, Carly, and Ang —\nFeliz cumpleaños from Seville 🇪🇸❤️",
];

export default function TonyBirthdayModal() {
  const [phase, setPhase] = useState<"hidden" | "loading" | "reveal">("hidden");
  const [jokeIndex, setJokeIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Check if we should show the modal
    const spainDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (spainDate !== "2026-05-17") return;
    if (sessionStorage.getItem("spain-tony-birthday-shown")) return;

    // Trigger after 2s delay
    const timer = setTimeout(() => {
      setPhase("loading");
      sessionStorage.setItem("spain-tony-birthday-shown", "true");

      // Transition to reveal
      setTimeout(() => {
        setPhase("reveal");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }, 1500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const nextJoke = useCallback(() => {
    if (jokeIndex < jokes.length - 1) {
      setJokeIndex((i) => i + 1);
    }
  }, [jokeIndex]);

  const close = useCallback(() => {
    setPhase("hidden");
    setJokeIndex(0);
  }, []);

  // Replay function (called from outside via ref or global)
  useEffect(() => {
    (window as unknown as Record<string, () => void>).__replayTonyBirthday = () => {
      setPhase("reveal");
      setJokeIndex(0);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 transition-opacity duration-400"
        style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)" }}
        onClick={phase === "reveal" ? close : undefined}
      />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 70 }).map((_, i) => {
            const isStreamer = i % 4 === 0;
            const drift = (Math.random() - 0.5) * 60;
            const spin = 360 + Math.random() * 720;
            return (
              <div
                key={i}
                className={`absolute ${isStreamer ? "" : i % 2 === 0 ? "rounded-full" : "rounded-sm"}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: -10,
                  width: isStreamer ? 3 : 5 + Math.random() * 5,
                  height: isStreamer ? 10 + Math.random() * 6 : 5 + Math.random() * 5,
                  background: i % 3 === 0 ? "#FEBE10" : i % 3 === 1 ? "#0A1128" : "#FFFFFF",
                  ["--drift" as string]: `${drift}px`,
                  ["--spin" as string]: `${spin}deg`,
                  animation: `confetti-drift ${1.2 + Math.random() * 1}s ease-out ${Math.random() * 0.8}s forwards`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Modal card */}
      <div
        className="relative rounded-3xl p-6 w-full max-w-sm text-center animate-slide-up"
        style={{ background: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "loading" ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-t-[#FEBE10] border-r-[#FEBE10] border-b-transparent border-l-transparent animate-spin" />
            <p className="text-[14px] mt-4 text-[#666]">Loading match day experience...</p>
          </>
        ) : (
          <>
            <p className="text-[40px] mb-2">🎂</p>
            <h2
              className="text-[28px] leading-tight"
              style={{ fontFamily: "var(--font-display, 'DM Serif Display')", color: "#1B2A4A" }}
            >
              Feliz Cumpleaños, Tony!
            </h2>
            <p className="text-[13px] mt-1 text-[#666] italic">
              The man who&apos;s never on time for anything... except his birthday.
            </p>

            {/* Joke card */}
            <div
              className="mt-5 p-4 rounded-xl text-left cursor-pointer min-h-[80px] flex items-center"
              style={{ background: "#FDF6EC" }}
              onClick={nextJoke}
            >
              <p className="text-[14px] leading-relaxed whitespace-pre-line" style={{ color: "#1B2A4A" }}>
                {jokes[jokeIndex]}
              </p>
            </div>

            {jokeIndex < jokes.length - 1 && (
              <p className="text-[11px] mt-2 text-[#999]">Tap to see next →</p>
            )}

            <button
              onClick={close}
              className="w-full mt-5 py-3 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98]"
              style={{ background: "#FEBE10", color: "#0A1128" }}
            >
              Gracias, gracias 🙌
            </button>
          </>
        )}
      </div>
    </div>
  );
}
