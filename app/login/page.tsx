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
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FFFDF7" }}
    >
      <div className="w-full max-w-sm text-center">
        {/* Hero */}
        <h1
          className="text-[48px] tracking-wider leading-none"
          style={{ fontFamily: "var(--font-display)", color: "#1B2A4A" }}
        >
          SPAIN
        </h1>
        <div
          className="h-1.5 w-32 mx-auto mt-2 rounded-full animate-shimmer"
          style={{
            background: "linear-gradient(90deg, #C0392B, #D4A843, #5D6D3F, #D4A843, #C0392B)",
            backgroundSize: "200% 100%",
          }}
        />
        <p
          className="text-[13px] mt-3 tracking-widest uppercase"
          style={{ color: "#1B2A4A", opacity: 0.4 }}
        >
          May 15 – 22, 2026
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-10">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="w-full px-4 py-3.5 rounded-xl text-[15px] text-center outline-none transition-all"
            style={{
              background: "white",
              border: error ? "1.5px solid #C0392B" : "1.5px solid rgba(27, 42, 74, 0.1)",
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
              background: "#1B2A4A",
              color: "white",
              fontFamily: "var(--font-body)",
            }}
          >
            {loading ? "..." : "Enter"}
          </button>
        </form>

        <p
          className="text-[11px] mt-8"
          style={{ color: "#1B2A4A", opacity: 0.15 }}
        >
          built by negative space llc
        </p>
      </div>
    </div>
  );
}
