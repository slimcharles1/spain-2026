import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Shared-password gate. Runs on every request that isn't a known public
 * path and redirects unauthenticated traffic to /login. Next.js 16 picks
 * this up automatically via the `proxy.ts` convention.
 *
 * NEG-67: the authoritative cookie is `trip_auth=1`. The legacy cookie
 * `spain-auth=authenticated` is still honored so an existing authenticated
 * browser session keeps working while users migrate.
 */

const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/persona", // /persona is authed-but-no-persona; proxy still enforces auth via cookie check below
]);

function isPublicAsset(pathname: string): boolean {
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/icons/")) return true;
  if (pathname === "/manifest.json" || pathname === "/favicon.ico") return true;
  return /\.(png|jpe?g|svg|webp|ico|woff2?|ttf|txt|xml|map)$/.test(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always let the login page + auth APIs + static assets through.
  if (pathname === "/login" || isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const tripAuth = request.cookies.get("trip_auth")?.value === "1";
  const legacyAuth =
    request.cookies.get("spain-auth")?.value === "authenticated";
  if (tripAuth || legacyAuth) return NextResponse.next();

  // /persona is only meaningful when authed — unauth'd users hit /login.
  if (PUBLIC_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
