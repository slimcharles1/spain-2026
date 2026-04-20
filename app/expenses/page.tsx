// EXPENSES page (NEG-75).
//
// Server component: reads real rows from Supabase `expenses` table,
// then hands them to the client view. When the table is empty, the view
// renders a clean zero state — no hardcoded mock data anywhere.
//
// Data shape stays on the legacy NEG-66 schema (paid_by: "cc"|"ta",
// split: "50-50"|"cc-only"|"ta-only") because the read-time adapter in
// `lib/expense-data.ts` already normalizes it. A later ticket (NEG-69)
// will migrate the table to a cleaner shape.

import { getServerSupabase } from "@/lib/supabase-server";
import type { ExpenseRow } from "@/lib/expense-data";
import ExpensesView from "./ExpensesView";

export const dynamic = "force-dynamic";

async function loadExpenses(): Promise<ExpenseRow[]> {
  const sb = getServerSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as ExpenseRow[];
}

export default async function ExpensesPage() {
  const expenses = await loadExpenses();
  return <ExpensesView initialExpenses={expenses} />;
}
