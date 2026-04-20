"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Root route is a dispatcher:
 *   - not authed → /login
 *   - authed but no currentUser persisted → /persona
 *   - else → /schedule
 *
 * Rendering happens on the client because the authoritative signals live in
 * a non-httpOnly cookie mirror + localStorage.
 */
export default function Home() {
  const router = useRouter();
  const { isAuthed, currentUser, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed) {
      router.replace("/login");
      return;
    }
    if (!currentUser) {
      router.replace("/persona");
      return;
    }
    router.replace("/schedule");
  }, [hydrated, isAuthed, currentUser, router]);

  // Transient splash — keeps the cream background while we redirect so the
  // user never sees a flash of the old home layout.
  return (
    <main
      aria-busy="true"
      style={{
        minHeight: "100svh",
        background: "#FFFCF5",
      }}
    />
  );
}
