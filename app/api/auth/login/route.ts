import { NextResponse } from "next/server";

/**
 * Trip login. Compares the submitted password against TRIP_PASSWORD (env).
 * On match, sets two cookies:
 *   - `trip_auth=1` (httpOnly) — the real auth signal, used by server code.
 *   - `trip_auth_present=1` (readable) — mirrors the above so the client can
 *     tell it's authed without a network roundtrip.
 *
 * Comparison is case-insensitive + trimmed (lowercase both sides) so that
 * "Sevilla", "SEVILLA", and " sevilla " all unlock the trip.
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function normalize(s: string | undefined | null): string {
  return (s ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const submitted = typeof body.password === "string" ? body.password : "";
  if (!submitted) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const expected = process.env.TRIP_PASSWORD;
  if (!expected) {
    // Misconfiguration — do NOT silently accept any password.
    return NextResponse.json(
      { error: "Server is missing TRIP_PASSWORD" },
      { status: 500 }
    );
  }

  if (normalize(submitted) !== normalize(expected)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("trip_auth", "1", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  response.cookies.set("trip_auth_present", "1", {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}
