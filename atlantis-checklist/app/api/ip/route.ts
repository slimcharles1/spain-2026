import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return NextResponse.json({ ip });
}
