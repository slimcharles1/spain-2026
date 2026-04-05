"use client";

interface AppleMapsButtonProps {
  location: {
    name: string;
    address?: string;
    query?: string;
    lat?: number;
    lng?: number;
  };
  variant?: "icon" | "pill";
}

function buildAppleMapsUrl(location: AppleMapsButtonProps["location"]): string {
  if (location.lat && location.lng) {
    return `https://maps.apple.com/?ll=${location.lat},${location.lng}&q=${encodeURIComponent(location.name)}`;
  }
  if (location.address) {
    return `https://maps.apple.com/?address=${encodeURIComponent(location.address)}`;
  }
  const query = location.query || location.name;
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}

export default function AppleMapsButton({ location, variant = "icon" }: AppleMapsButtonProps) {
  const url = buildAppleMapsUrl(location);

  if (variant === "pill") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-transform active:scale-95"
        style={{ background: "rgba(27, 42, 74, 0.06)", color: "var(--theme-text)" }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Navigate
      </a>
    );
  }

  // icon variant
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90 shrink-0"
      style={{ background: "rgba(27, 42, 74, 0.05)" }}
      aria-label={`Navigate to ${location.name}`}
    >
      <svg className="w-4 h-4" style={{ color: "var(--theme-accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </a>
  );
}
