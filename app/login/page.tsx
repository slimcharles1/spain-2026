"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PosterStripe } from "@/components/design-system/PosterStripe";
import { Button } from "@/components/design-system/Button";

/**
 * Login — SPAIN / 2026 wordmark hero over a poster stripe, cream password
 * card, red "UNLOCK TRIP" button. Design reference: Pencil node 21edL.
 */
export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/persona");
        router.refresh();
        return;
      }
      setError("Wrong password");
      setPassword("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      data-testid="login-page"
      style={{
        minHeight: "100svh",
        background: "#FFFCF5",
        color: "#1B2A4A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "56px 24px 32px",
      }}
    >
      <section
        aria-label="Spain 2026"
        style={{
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
          marginTop: 24,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 64,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            margin: 0,
            color: "#1B2A4A",
          }}
        >
          SPAIN
        </h1>
        <div style={{ margin: "8px 0" }}>
          <PosterStripe height={6} />
        </div>
        <div
          aria-hidden
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 64,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: "#CC2E2C",
          }}
        >
          2026
        </div>

        <p
          style={{
            marginTop: 18,
            fontFamily: "var(--font-mono, var(--font-body))",
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          4 friends · 7 days · Madrid &rarr; Sevilla
        </p>
        <p
          style={{
            marginTop: 6,
            fontFamily: "var(--font-archivo-black)",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#8B1E1C",
          }}
        >
          MAY 16 &ndash; 22, 2026
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        aria-label="Unlock the trip"
        style={{
          width: "100%",
          maxWidth: 420,
          marginTop: 40,
          background: "#FFF8E7",
          border: "1px solid rgba(27, 42, 74, 0.12)",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 1px 0 rgba(27, 42, 74, 0.04)",
        }}
      >
        <label
          htmlFor="trip-password"
          style={{
            display: "block",
            fontFamily: "var(--font-archivo-black)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "#1B2A4A",
            marginBottom: 8,
          }}
        >
          ENTER PASSWORD
        </label>
        <input
          id="trip-password"
          type="password"
          autoFocus
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby="password-hint"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            background: "#FFFCF5",
            border: error
              ? "1.5px solid #CC2E2C"
              : "1px solid rgba(27, 42, 74, 0.2)",
            fontSize: 16,
            color: "#1B2A4A",
            outline: "none",
            fontFamily: "var(--font-mono, var(--font-body))",
          }}
        />
        <p
          id="password-hint"
          style={{
            marginTop: 8,
            fontFamily: "var(--font-mono, var(--font-body))",
            fontSize: 12,
            color: "#8B7355",
          }}
        >
          Hint: where are we going?
        </p>
        {error && (
          <p
            role="alert"
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#CC2E2C",
              fontFamily: "var(--font-mono, var(--font-body))",
            }}
          >
            {error}
          </p>
        )}
        <div style={{ marginTop: 16 }}>
          <Button
            type="submit"
            variant="primary"
            block
            disabled={loading || !password}
            style={{ opacity: loading || !password ? 0.55 : 1, padding: "18px 20px", fontSize: 15 }}
          >
            {loading ? "UNLOCKING…" : "UNLOCK TRIP"}
          </Button>
        </div>
      </form>

      <footer
        style={{
          marginTop: "auto",
          paddingTop: 48,
          fontFamily: "var(--font-mono, var(--font-body))",
          fontSize: 10,
          color: "#9ca3af",
        }}
      >
        Built by negative.space · v1.0
      </footer>
    </main>
  );
}
