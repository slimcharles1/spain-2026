import { NextResponse } from "next/server";

/**
 * Expire both auth cookies. Paired with AuthProvider.logout().
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  const expired = {
    path: "/",
    maxAge: 0,
    secure,
    sameSite: "lax" as const,
  };
  response.cookies.set("trip_auth", "", { ...expired, httpOnly: true });
  response.cookies.set("trip_auth_present", "", { ...expired, httpOnly: false });
  return response;
}
