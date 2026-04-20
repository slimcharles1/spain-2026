// Server-side Supabase client (NEG-75).
//
// Used by server components that need to read from Supabase at request
// time — unlike `lib/supabase.ts`, which returns a browser-friendly
// client memoized in module scope. We still use the public anon key
// here: the tables involved are read-only for end users and protected
// by RLS policies on the Supabase side.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getServerSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "https://your-project.supabase.co") {
    return null;
  }

  // Don't memoize — each request should get its own client so Next.js
  // request-scoped caching (fetch/cookies) is respected if we add it later.
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
