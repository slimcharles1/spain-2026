"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackPageView, getUserId, getUserName, setUserName } from "@/lib/analytics";

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Track page views on navigation
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // Ask for name on first visit
  useEffect(() => {
    const name = getUserName();
    if (!name) {
      // Small delay so the page loads first
      const t = setTimeout(() => setShowPrompt(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSetName = () => {
    const name = nameInput.trim();
    if (name) {
      setUserName(name);
      setShowPrompt(false);
    }
  };

  // Force user ID generation on mount
  useEffect(() => {
    getUserId();
  }, []);

  return (
    <>
      {children}

      {/* Name prompt modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="bg-ocean-800 rounded-2xl p-5 max-w-sm w-full border border-white/10">
            <div className="text-3xl text-center mb-3">👋</div>
            <h3 className="text-white font-display text-lg text-center mb-2">
              Who&apos;s using the app?
            </h3>
            <p className="text-white/50 text-xs text-center mb-4">
              Enter your first name so we can track who&apos;s using what
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetName()}
              placeholder="Your first name"
              autoFocus
              className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setUserName("Guest");
                  setShowPrompt(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/50 text-sm font-medium hover:bg-white/15 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSetName}
                disabled={!nameInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-mint/20 text-mint text-sm font-semibold disabled:opacity-30 hover:bg-mint/30 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
