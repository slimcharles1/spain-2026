"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Wrong password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #FFFCF5 0%, #FDF6EC 40%, #FAF0DC 100%)",
      }}
    >
      {/* Azulejo background texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            conic-gradient(from 0deg at 50% 50%,
              rgba(192, 57, 43, 0.03) 0deg 45deg,
              transparent 45deg 90deg,
              rgba(212, 168, 67, 0.025) 90deg 135deg,
              transparent 135deg 180deg,
              rgba(192, 57, 43, 0.03) 180deg 225deg,
              transparent 225deg 270deg,
              rgba(212, 168, 67, 0.025) 270deg 315deg,
              transparent 315deg 360deg
            )`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Warm radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(212, 168, 67, 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="w-full max-w-sm text-center relative z-10">
        {/* Decorative arch frame */}
        <div
          className="mx-auto mb-8 pt-10 pb-6 px-6"
          style={{
            borderRadius: "50% 50% 16px 16px / 30% 30% 16px 16px",
            border: "1px solid rgba(212, 168, 67, 0.2)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)",
            backdropFilter: "blur(8px)",
            maxWidth: 260,
          }}
        >
          <h1
            className="text-[48px] tracking-[0.2em] leading-none"
            style={{ fontFamily: "var(--font-display)", color: "#1B2A4A" }}
          >
            SPAIN
          </h1>
          <div
            className="h-1 w-24 mx-auto mt-3 rounded-full animate-shimmer"
            style={{
              background: "linear-gradient(90deg, #C0392B, #D4A843, #5D6D3F, #D4A843, #C0392B)",
              backgroundSize: "200% 100%",
            }}
          />
          <p
            className="text-[11px] mt-3 tracking-[0.3em] uppercase"
            style={{ color: "#1B2A4A", opacity: 0.35 }}
          >
            Madrid & Seville
          </p>
          <p
            className="text-[10px] mt-1 tracking-[0.2em]"
            style={{ color: "#1B2A4A", opacity: 0.2 }}
          >
            May 15 &ndash; 22, 2026
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrase&ntilde;a"
            autoFocus
            className="w-full px-4 py-3.5 rounded-xl text-[15px] text-center outline-none transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(10px)",
              border: error ? "1.5px solid #C0392B" : "1.5px solid rgba(212, 168, 67, 0.2)",
              color: "#1B2A4A",
              fontFamily: "var(--font-body)",
            }}
          />
          {error && (
            <p className="text-[13px] mt-2" style={{ color: "#C0392B" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-4 py-3.5 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #1B2A4A 0%, #2d4a7a 100%)",
              color: "white",
              fontFamily: "var(--font-body)",
              boxShadow: "0 4px 16px rgba(27, 42, 74, 0.2)",
            }}
          >
            {loading ? "..." : "Entrar"}
          </button>
        </form>

        <p
          className="text-[11px] mt-10"
          style={{ color: "#1B2A4A", opacity: 0.12 }}
        >
          built by negative space llc
        </p>
      </div>
    </div>
  );
}
