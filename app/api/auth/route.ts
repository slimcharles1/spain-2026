import { NextResponse } from "next/server";

// SHA-256 hash — password is never stored in plaintext
const EXPECTED_HASH = "8fc0293969dac57c25a58c82f2f4c43bf5cd8b37fcb70c4d7bfa80a8f7cb5b2c";

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password?.toLowerCase().trim();

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const hash = await sha256(password);

  if (hash !== EXPECTED_HASH) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("spain-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });

  return response;
}
