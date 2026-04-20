"use client";

import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { useAuth } from "@/lib/auth-context";

/**
 * CurrentUserAvatar — the top-right switch-persona affordance.
 *
 * Mounted once at the layout root. On every post-auth screen it floats a
 * 28px avatar of the active traveler in the top-right corner; tapping it
 * routes to `/persona` where the user can pick a different persona.
 *
 * Visibility rules:
 *   - Only rendered when the user is authenticated AND a persona is set.
 *   - Hidden on the onboarding screens (`/login` and `/persona`) so the
 *     affordance never competes with the picker itself.
 */
export function CurrentUserAvatar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthed, currentUser } = useAuth();

  if (!isAuthed || !currentUser) return null;
  if (pathname === "/login" || pathname === "/persona") return null;

  return (
    <button
      type="button"
      data-testid="current-user-avatar"
      aria-label={`Switch persona (currently ${currentUser})`}
      onClick={() => router.push("/persona")}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 60,
        padding: 0,
        border: "none",
        background: "transparent",
        borderRadius: 999,
        cursor: "pointer",
        lineHeight: 0,
        // Subtle shadow keeps the circle legible over any screen content.
        boxShadow: "0 2px 8px rgba(27, 42, 74, 0.18)",
      }}
    >
      <Avatar size={28} person={currentUser} />
    </button>
  );
}

export default CurrentUserAvatar;
