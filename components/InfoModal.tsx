"use client";

import { useState, useEffect } from "react";
import { flightInfo, infoSections } from "@/lib/info-data";
import AppleMapsButton from "./AppleMapsButton";

const CONFIRMATIONS_KEY = "spain-my-confirmations";

interface MyConfirmations {
  [key: string]: string;
}

function loadConfirmations(): MyConfirmations {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(CONFIRMATIONS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveConfirmations(data: MyConfirmations) {
  localStorage.setItem(CONFIRMATIONS_KEY, JSON.stringify(data));
}

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InfoModal({ open, onClose }: InfoModalProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [myConfs, setMyConfs] = useState<MyConfirmations>({});

  useEffect(() => {
    if (open) setMyConfs(loadConfirmations());
  }, [open]);

  const updateConf = (key: string, value: string) => {
    setMyConfs((prev) => {
      const next = { ...prev, [key]: value };
      saveConfirmations(next);
      return next;
    });
  };

  if (!open) return null;

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative h-full w-full animate-slide-up overflow-y-auto"
        style={{ background: "var(--theme-bg)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-12 pb-3" style={{ background: "var(--theme-bg)" }}>
          <h1 className="text-[28px]" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
            📋 Info
          </h1>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "rgba(27, 42, 74, 0.06)" }}
          >
            <svg className="w-5 h-5" style={{ color: "var(--theme-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Flight badges */}
        <div className="flex gap-2 px-5 pb-4">
          {[flightInfo.outbound, flightInfo.return].map((flight) => (
            <div
              key={flight.label}
              className="flex-1 rounded-xl p-3.5"
              style={{
                background: "var(--theme-card)",
                borderLeft: "4px solid #1B2A4A",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div className="text-[10px] font-bold tracking-widest" style={{ color: "var(--theme-text-secondary)" }}>
                {flight.label}
              </div>
              <div className="text-[15px] font-bold mt-0.5" style={{ color: "var(--theme-text)" }}>
                {flight.route}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: "var(--theme-text-secondary)" }}>
                {flight.airline} · {flight.date}
              </div>
              <div className="text-[12px]" style={{ color: "var(--theme-text-secondary)" }}>
                {flight.detail}
              </div>
              {flight.confirmation && (
                <div className="text-[11px] font-bold mt-1" style={{ color: "#C0392B" }}>
                  {flight.confirmation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Your Confirmations — editable per-device */}
        <div className="px-5 pb-4">
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--theme-card)",
              border: "1px solid var(--theme-border)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            <h3 className="text-[13px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
              Your Confirmations
            </h3>
            <p className="text-[11px] mb-3" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
              Save your own booking references here — stored on this device only.
            </p>
            <div className="space-y-2">
              {[
                { key: "flight", label: "Flight (Iberia)" },
                { key: "urso", label: "URSO Hotel (May 16)" },
                { key: "colon", label: "Colón Gran Meliá (May 17-19)" },
                { key: "ingles", label: "Gran Hotel Inglés (May 20-21)" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="text-[12px] w-[140px] shrink-0" style={{ color: "var(--theme-text-secondary)" }}>
                    {item.label}
                  </span>
                  <input
                    type="text"
                    placeholder="Conf #"
                    value={myConfs[item.key] ?? ""}
                    onChange={(e) => updateConf(item.key, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
                    style={{
                      background: "rgba(27, 42, 74, 0.03)",
                      border: "1px solid rgba(27, 42, 74, 0.08)",
                      color: "var(--theme-text)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="px-5 pb-20 space-y-2">
          {infoSections.map((section) => {
            const isCollapsed = collapsed.has(section.id);

            return (
              <div
                key={section.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--theme-card)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center gap-3 p-4 text-left active:scale-[0.99] transition-transform"
                >
                  <span className="text-lg">{section.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-semibold" style={{ color: "var(--theme-text)" }}>
                      {section.title}
                    </span>
                    {isCollapsed && (
                      <span className="text-[12px] ml-2" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
                        {section.summary}
                      </span>
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 transition-transform duration-200 shrink-0"
                    style={{
                      color: "var(--theme-text-secondary)",
                      opacity: 0.3,
                      transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
                    }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {!isCollapsed && (
                  <div className="px-4 pb-4 space-y-2">
                    {section.items.map((item, i) => {
                      if (item.text === "—") {
                        return <hr key={i} className="my-2" style={{ borderColor: "var(--theme-border)" }} />;
                      }
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[11px] mt-1" style={{ color: "#5D6D3F" }}>•</span>
                          <div className="flex-1">
                            <span
                              className={`text-[13px] leading-relaxed ${item.emphasis ? "font-semibold" : ""}`}
                              style={{ color: item.emphasis ? "var(--theme-text)" : "var(--theme-text-secondary)" }}
                            >
                              {item.url ? (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline">
                                  {item.text}
                                </a>
                              ) : (
                                item.text
                              )}
                            </span>
                            {item.mapsQuery && (
                              <span className="inline-block ml-2">
                                <AppleMapsButton
                                  location={{ name: item.text, query: item.mapsQuery }}
                                  variant="pill"
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
