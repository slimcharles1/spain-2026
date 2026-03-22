import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface PackingItem {
  id: string;
  category_id: string;
  text: string;
  checked: boolean;
  sort_order: number;
  is_seed: boolean;
  created_at: string;
}

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "https://your-project.supabase.co") {
    return null;
  }

  supabase = createClient(url, key);
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
