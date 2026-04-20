"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PosterStripe } from "@/components/design-system/PosterStripe";
import { Avatar } from "@/components/design-system/Avatar";
import { useAuth, type Persona } from "@/lib/auth-context";

/**
 * Persona Select — tap your face to continue, we'll remember for today.
 * Design reference: Pencil node ASnQE.
 *
 * Tiles are alphabetical: Ang · Carly · Charles · Tony. No "Add someone"
 * link. No bottom nav.
 */

const TILES: ReadonlyArray<{ persona: Persona; name: string }> = [
  { persona: "ang", name: "Ang" },
  { persona: "carly", name: "Carly" },
  { persona: "charles", name: "Charles" },
  { persona: "tony", name: "Tony" },
];

export default function PersonaPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();

  const choose = (persona: Persona) => {
    setCurrentUser(persona);
    router.push("/schedule");
  };

  return (
    <main
      data-testid="persona-page"
      style={{
        minHeight: "100svh",
        background: "#FFFCF5",
        color: "#1B2A4A",
        padding: "56px 24px 32px",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-mono, var(--font-body))",
              fontSize: 14,
              color: "#1B2A4A",
              textDecoration: "none",
            }}
          >
            &larr; Back
          </Link>
          <span
            style={{
              fontFamily: "var(--font-archivo-black)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "#8B7355",
            }}
          >
            STEP 2 OF 2
          </span>
        </div>

        <PosterStripe height={6} />

        <h1
          style={{
            fontFamily: "var(--font-archivo-black)",
            fontSize: 40,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            margin: "24px 0 8px",
          }}
        >
          Who&rsquo;s here?
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono, var(--font-body))",
            fontSize: 14,
            color: "#6b7280",
            margin: 0,
            marginBottom: 24,
          }}
        >
          Tap your face to continue. We&rsquo;ll remember for today.
        </p>

        <ul
          role="list"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {TILES.map(({ persona, name }) => (
            <li key={persona}>
              <button
                type="button"
                onClick={() => choose(persona)}
                data-testid={`persona-tile-${persona}`}
                aria-label={`Continue as ${name}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  padding: "12px 16px",
                  background: "#FFF8E7",
                  border: "1px solid rgba(27, 42, 74, 0.12)",
                  borderRadius: 14,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: "inherit",
                  transition: "transform 120ms ease, background 120ms ease",
                }}
              >
                <Avatar person={persona} size={64} showName />
                <span
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-archivo-black)",
                    fontSize: 20,
                    letterSpacing: "0.02em",
                  }}
                >
                  {name}
                </span>
                <span
                  aria-hidden
                  style={{
                    fontFamily: "var(--font-archivo-black)",
                    fontSize: 22,
                    color: "#8B7355",
                  }}
                >
                  &rarr;
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
