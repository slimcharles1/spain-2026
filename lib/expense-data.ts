// Expense data model, personas, categories, and settlement math.
//
// Preserves the existing Supabase `expenses` table schema (id, amount,
// description, category, paid_by, split, created_at) by treating `split`
// as a string key that maps to the set of people who consumed the expense.
// This lets the NEG-66 rewrite show per-person balances without migrating
// the DB. A future ticket can move `split` into a jsonb consumers[] column.

export type PersonId = "charles" | "carly" | "tony" | "ang";

export interface Person {
  id: PersonId;
  name: string;
  initials: string; // 1-2 chars for avatar fallback
  bg: string; // avatar background hex
  fg: string; // avatar text hex
  stroke?: string; // optional avatar stroke (for Tony's navy+gold)
  couple: "cc" | "ta";
  admin?: boolean;
}

export const PEOPLE: Person[] = [
  { id: "charles", name: "Charles", initials: "C", bg: "#CC2E2C", fg: "#FFD23F", couple: "cc", admin: true },
  { id: "carly", name: "Carly", initials: "C", bg: "#FFD23F", fg: "#1B2A4A", couple: "cc" },
  { id: "tony", name: "Tony", initials: "T", bg: "#1E4D92", fg: "#FFD23F", stroke: "#FFD23F", couple: "ta" },
  { id: "ang", name: "Ang", initials: "A", bg: "#FF3E7F", fg: "#FFFFFF", couple: "ta" },
];

export const PERSON_BY_ID: Record<PersonId, Person> = PEOPLE.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<PersonId, Person>);

export interface ExpenseCategory {
  id: string;
  emoji: string;
  label: string;
  color: string; // bar + chip color
}

// Five category buckets from the Pencil design (G2Th2 "BY CATEGORY").
export const CATEGORIES: ExpenseCategory[] = [
  { id: "dining", emoji: "🍽️", label: "Dining", color: "#CC2E2C" },
  { id: "hotels", emoji: "🏨", label: "Hotels", color: "#1E4D92" },
  { id: "activities", emoji: "🏛️", label: "Activities", color: "#FFD23F" },
  { id: "transit", emoji: "✈️", label: "Transit", color: "#FF3E7F" },
  { id: "other", emoji: "🛍️", label: "Other", color: "#6B6B6B" },
];

export const CATEGORY_BY_ID: Record<string, ExpenseCategory> = CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {} as Record<string, ExpenseCategory>);

// Legacy split keys the existing Supabase rows used. We preserve them and
// map each one to the canonical `consumers` list used by the new UI.
export type LegacySplit = "50-50" | "cc-only" | "ta-only";

export interface ExpenseRow {
  id: string;
  amount: number;
  description: string;
  category: string; // maps to CATEGORIES.id or legacy string
  paid_by: PersonId | "cc" | "ta"; // allow legacy couple ids during rollout
  split: LegacySplit | PersonId[] | string; // jsonb-ready list, or legacy string
  created_at: string;
}

// ---------- Helpers: person / category / consumer resolution ----------

const LEGACY_COUPLE_TO_PEOPLE: Record<"cc" | "ta", PersonId[]> = {
  cc: ["charles", "carly"],
  ta: ["tony", "ang"],
};

const LEGACY_CATEGORY_TO_BUCKET: Record<string, string> = {
  dining: "dining",
  wine: "dining",
  transport: "transit",
  activities: "activities",
  shopping: "other",
  other: "other",
  hotels: "hotels",
  hotel: "hotels",
  transit: "transit",
};

/** Normalize a category id (legacy or new) into one of the 5 buckets. */
export function resolveCategory(raw: string): ExpenseCategory {
  const bucket = LEGACY_CATEGORY_TO_BUCKET[raw] ?? raw;
  return CATEGORY_BY_ID[bucket] ?? CATEGORY_BY_ID.other;
}

/** Resolve who paid. Legacy `cc`/`ta` → first person in couple. */
export function resolvePayer(raw: ExpenseRow["paid_by"]): PersonId {
  if (raw === "cc") return "charles";
  if (raw === "ta") return "tony";
  return raw;
}

/** Resolve the list of people who consumed / share the expense. */
export function resolveConsumers(row: ExpenseRow): PersonId[] {
  if (Array.isArray(row.split)) return row.split;
  if (row.split === "50-50") return ["charles", "carly", "tony", "ang"];
  if (row.split === "cc-only") return LEGACY_COUPLE_TO_PEOPLE.cc;
  if (row.split === "ta-only") return LEGACY_COUPLE_TO_PEOPLE.ta;
  // Unknown — fall back to 4-way split so balances stay computable.
  return ["charles", "carly", "tony", "ang"];
}

// ---------- Settlement math ----------

export interface PersonBalance {
  id: PersonId;
  paid: number;       // total this person paid
  share: number;      // total this person consumed
  net: number;        // paid - share (>0 is owed, <0 owes)
}

export interface Debt {
  from: PersonId; // debtor
  to: PersonId;   // creditor
  amount: number; // € rounded to 2 dp
}

/**
 * Per-person balances from a list of expenses.
 *
 * - `paid` is straight sum of amounts where person is payer
 * - `share` is sum of (amount / consumers.length) for every expense where
 *   person appears in `consumers`. Equal-share only for now — matches the
 *   pencil design; unequal splits can follow.
 */
export function computeBalances(expenses: ExpenseRow[]): PersonBalance[] {
  const paid: Record<PersonId, number> = { charles: 0, carly: 0, tony: 0, ang: 0 };
  const share: Record<PersonId, number> = { charles: 0, carly: 0, tony: 0, ang: 0 };

  for (const exp of expenses) {
    const payer = resolvePayer(exp.paid_by);
    paid[payer] += exp.amount;

    const consumers = resolveConsumers(exp);
    if (consumers.length === 0) continue;
    const perHead = exp.amount / consumers.length;
    for (const c of consumers) {
      share[c] += perHead;
    }
  }

  return PEOPLE.map((p) => ({
    id: p.id,
    paid: round2(paid[p.id]),
    share: round2(share[p.id]),
    net: round2(paid[p.id] - share[p.id]),
  }));
}

/**
 * Greedy minimum-transfer settlement: repeatedly match the biggest creditor
 * with the biggest debtor until all nets are ~0. For 4 people this gives an
 * optimal or near-optimal 1-3 transfer plan.
 */
export function computeSettlements(balances: PersonBalance[]): Debt[] {
  const debts: Debt[] = [];
  // clone nets so we can mutate
  const nets = balances.map((b) => ({ id: b.id, net: b.net }));

  while (true) {
    const creditor = nets.reduce((a, b) => (b.net > a.net ? b : a));
    const debtor = nets.reduce((a, b) => (b.net < a.net ? b : a));
    if (creditor.net <= 0.01 || debtor.net >= -0.01) break;
    const amount = round2(Math.min(creditor.net, -debtor.net));
    if (amount <= 0.01) break;
    debts.push({ from: debtor.id, to: creditor.id, amount });
    creditor.net = round2(creditor.net - amount);
    debtor.net = round2(debtor.net + amount);
  }

  // Sort debts largest-first so the SETTLE UP card can pick the top one.
  return debts.sort((a, b) => b.amount - a.amount);
}

/** Top debt for the yellow SETTLE UP card (null when settled). */
export function topDebt(expenses: ExpenseRow[]): Debt | null {
  const balances = computeBalances(expenses);
  const settlements = computeSettlements(balances);
  return settlements[0] ?? null;
}

/** Aggregate amounts per category bucket, sorted by amount desc. */
export function sumByCategory(expenses: ExpenseRow[]): Array<{ category: ExpenseCategory; amount: number }> {
  const sums = new Map<string, number>();
  for (const exp of expenses) {
    const cat = resolveCategory(exp.category);
    sums.set(cat.id, (sums.get(cat.id) ?? 0) + exp.amount);
  }
  return CATEGORIES.map((c) => ({ category: c, amount: round2(sums.get(c.id) ?? 0) })).sort(
    (a, b) => b.amount - a.amount,
  );
}

/** Sum of all expense amounts. */
export function totalSpent(expenses: ExpenseRow[]): number {
  return round2(expenses.reduce((sum, e) => sum + e.amount, 0));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------- Budget (static for now — trip-level) ----------
// The app hasn't persisted a budget yet; pencil design shows €3,500.
// Expose as a constant so UI + tests agree.
export const TRIP_BUDGET_EUR = 3500;
