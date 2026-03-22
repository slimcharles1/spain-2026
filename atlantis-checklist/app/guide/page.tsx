"use client";

import { useState } from "react";
import { guideSections, mapLocations, getLocationById } from "@/lib/guide-data";

function getAppleMapsUrl(lat: number, lng: number) {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&t=m`;
}

function getGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

export default function GuidePage() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectedLocation, setSelectedLocation] = useState(mapLocations[0]);

  const mapEmbedUrl = `https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=16&output=embed`;

  return (
    <div className="min-h-screen font-body">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-ocean-950 to-ocean-900 pb-4 shadow-lg shadow-ocean-950/50">
        <div className="px-5 pt-10 pb-2 text-center">
          <h1 className="font-display text-3xl bg-gradient-to-r from-gold via-coral to-pink bg-clip-text text-transparent">
            Guide &amp; Map
          </h1>
          <p className="text-white/50 text-sm mt-1 tracking-wide">
            Tips for The Reef — with toddlers in tow
          </p>
        </div>
      </div>

      {/* Map & Directions */}
      <div className="px-4 py-4">
        <div className="bg-ocean-800/60 backdrop-blur rounded-2xl overflow-hidden border border-white/5">
          <div className="aspect-[4/3] w-full">
            <iframe
              width="100%"
              height="100%"
              src={mapEmbedUrl}
              title="Atlantis Resort Map"
              className="border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="p-3">
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {mapLocations.slice(0, 6).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`flex-shrink-0 flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                    selectedLocation.id === loc.id
                      ? "bg-white/15 text-white ring-1 ring-mint/40"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  <span>{loc.emoji}</span>
                  <span>{loc.name}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <a
                href={getAppleMapsUrl(selectedLocation.lat, selectedLocation.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-mint/15 text-mint text-xs font-semibold hover:bg-mint/25 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Apple Maps
              </a>
              <a
                href={getGoogleMapsUrl(selectedLocation.lat, selectedLocation.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-400/15 text-sky-400 text-xs font-semibold hover:bg-sky-400/25 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Sections */}
      <div className="px-4 pb-4 space-y-3">
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
                <div className="px-4 pb-4 space-y-3">
                  {section.items.map((item, i) => {
                    const loc = item.locationId ? getLocationById(item.locationId) : undefined;
                    return (
                      <div key={i}>
                        <div className="flex gap-2.5 text-sm">
                          <span className="text-mint/60 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-white/70 leading-relaxed">{item.text}</span>
                        </div>
                        {/* Hours badge and/or directions link */}
                        {(item.hours || loc) && (
                          <div className="flex flex-wrap items-center gap-2 ml-5 mt-1.5">
                            {item.hours && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-gold/80 bg-gold/10 px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {item.hours}
                              </span>
                            )}
                            {loc && (
                              <a
                                href={getAppleMapsUrl(loc.lat, loc.lng)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-mint/80 bg-mint/10 px-2 py-0.5 rounded-full hover:bg-mint/20 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Directions to {loc.name}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
    </div>
  );
}
