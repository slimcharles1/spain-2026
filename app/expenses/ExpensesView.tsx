"use client";

// EXPENSES view (NEG-75).
//
// Presentation + light interactivity for the expenses page. Fed real
// rows from the server component in `page.tsx`. MARK SETTLED still
// works as in NEG-66: it appends a synthetic settlement row that zeroes
// the top debt, writes it back to Supabase fire-and-forget, and updates
// local state so the UI reflects the new balance immediately.
//
// Zero state: when the table is empty, every number is €0, RECENT / BY
// CATEGORY render a single empty-state line, PAID BY shows €0 for all
// four people with no owes/owed line, and SETTLE UP shows the green
// "All squared up" confirmation.

import { useCallback, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  PEOPLE,
  PERSON_BY_ID,
  TRIP_BUDGET_EUR,
  computeBalances,
  computeSettlements,
  resolveCategory,
  resolvePayer,
  sumByCategory,
  topDebt,
  totalSpent,
  type ExpenseRow,
} from "@/lib/expense-data";
import SettleUpCard from "@/components/SettleUpCard";

interface Props {
  initialExpenses: ExpenseRow[];
}

export default function ExpensesView({ initialExpenses }: Props) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>(initialExpenses);

  const total = totalSpent(expenses);
  const remaining = Math.max(0, TRIP_BUDGET_EUR - total);
  const usedPct = Math.min(100, Math.round((total / TRIP_BUDGET_EUR) * 100));

  const byCategory = useMemo(() => sumByCategory(expenses), [expenses]);
  const balances = useMemo(() => computeBalances(expenses), [expenses]);
  const settlements = useMemo(() => computeSettlements(balances), [balances]);
  const debt = useMemo(() => topDebt(expenses), [expenses]);
  const maxCategoryAmount = Math.max(1, ...byCategory.map((b) => b.amount));

  const hasExpenses = expenses.length > 0;

  const handleMarkSettled = useCallback(() => {
    if (!debt) return;
    const settlementRow: ExpenseRow = {
      id: `settle-${Date.now()}`,
      amount: debt.amount,
      description: `Settlement · ${PERSON_BY_ID[debt.from].name} → ${PERSON_BY_ID[debt.to].name}`,
      category: "other",
      paid_by: debt.from,
      // Only the creditor "consumes" the settlement, which zeroes the balance.
      split: [debt.to],
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [settlementRow, ...prev]);
    const sb = getSupabase();
    if (sb) {
      // Fire-and-forget; the in-memory update is the source of truth for
      // the page until the next full server fetch.
      sb.from("expenses").insert(settlementRow).then(() => {});
    }
  }, [debt]);

  // Recent = 5 most-recent non-settlement rows.
  const recent = expenses
    .filter((e) => !e.id.startsWith("settle-"))
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const recentCount = expenses.filter((e) => !e.id.startsWith("settle-")).length;

  return (
    <div
      className="min-h-screen animate-fade-in"
      style={{ background: "#F5F1E8", color: "#1B2A4A" }}
      data-testid="expenses-page"
    >
      <div className="max-w-lg mx-auto px-[18px] pt-6 pb-20 flex flex-col gap-[14px]">
        {/* Header */}
        <div className="flex flex-col gap-1" data-testid="expenses-header">
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "#CC2E2C",
              fontSize: 10,
              letterSpacing: "0.2em",
            }}
          >
            MADRID · DAY 2 OF 7
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "#1B2A4A",
              fontSize: 36,
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            EXPENSES
          </h1>
        </div>

        {/* Poster stripe */}
        <div className="flex items-center gap-1.5" data-testid="poster-stripe" aria-hidden>
          <span className="h-1 rounded-sm" style={{ width: 60, background: "#CC2E2C" }} />
          <span className="h-1 rounded-sm" style={{ width: 28, background: "#FFD23F" }} />
          <span className="h-1 rounded-sm" style={{ width: 14, background: "#1E4D92" }} />
          <span className="h-1 rounded-sm" style={{ width: 28, background: "#FF3E7F" }} />
        </div>

        {/* Hero card */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1.5"
          style={{ background: "#1E4D92" }}
          data-testid="hero-card"
        >
          <span
            style={{ fontFamily: "var(--font-display)", color: "#FFD23F", fontSize: 10, letterSpacing: "0.18em" }}
          >
            TOTAL SPENT
          </span>
          <div
            style={{ fontFamily: "var(--font-display)", color: "#FFD23F", fontSize: 44, lineHeight: 1 }}
            data-testid="total-spent"
          >
            €{total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
          <div style={{ color: "#F5F1E8", fontSize: 12, opacity: 0.9 }}>
            of €{TRIP_BUDGET_EUR.toLocaleString("en-US")} budget · {usedPct}% used
          </div>
          <div className="rounded h-2 mt-1.5" style={{ background: "#0F3670" }}>
            <div
              className="rounded h-full"
              style={{ background: "#FFD23F", width: `${usedPct}%` }}
              data-testid="hero-progress"
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "#FFD23F",
              fontSize: 11,
              letterSpacing: "0.1em",
              marginTop: 4,
            }}
          >
            €{remaining.toLocaleString("en-US", { maximumFractionDigits: 0 })} remaining
          </span>
        </div>

        {/* BY CATEGORY */}
        <div
          className="rounded-xl p-3.5 flex flex-col gap-2.5"
          style={{ background: "#F5F1E8", border: "1px solid #E5DFD0" }}
          data-testid="category-card"
        >
          <span
            style={{ fontFamily: "var(--font-display)", color: "#6B6B6B", fontSize: 10, letterSpacing: "0.18em" }}
          >
            BY CATEGORY
          </span>
          {hasExpenses ? (
            <div className="flex flex-col gap-2">
              {byCategory.map(({ category, amount }) => {
                const pct = Math.max(0.01, amount / maxCategoryAmount);
                return (
                  <div key={category.id} className="flex flex-col gap-1" data-testid={`cat-${category.id}`}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#1B2A4A" }}>
                        {category.emoji}  {category.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#1B2A4A" }}>
                        €{amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#E5DFD0" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ background: category.color, width: `${pct * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p
              data-testid="category-empty"
              style={{ fontSize: 12, color: "#6B6B6B", padding: "4px 0" }}
            >
              No expenses yet. Tap <span style={{ fontWeight: 600, color: "#1B2A4A" }}>+ ADD EXPENSE</span> to start tracking.
            </p>
          )}
        </div>

        {/* PAID BY */}
        <div
          className="rounded-xl p-3.5 flex flex-col gap-2.5"
          style={{ background: "#F5F1E8", border: "1px solid #E5DFD0" }}
          data-testid="paid-by-card"
        >
          <span
            style={{ fontFamily: "var(--font-display)", color: "#6B6B6B", fontSize: 10, letterSpacing: "0.18em" }}
          >
            PAID BY
          </span>
          <div className="flex items-start gap-1.5 justify-between" data-testid="paid-by-row">
            {PEOPLE.map((p) => {
              const bal = balances.find((b) => b.id === p.id)!;
              const owes = bal.net < -0.01;
              const owed = bal.net > 0.01;
              return (
                <div
                  key={p.id}
                  className="flex-1 flex flex-col items-center gap-1"
                  data-testid={`paid-by-${p.id}`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: p.bg,
                      color: p.fg,
                      border: p.stroke ? `1px solid ${p.stroke}` : undefined,
                      fontFamily: "var(--font-display)",
                      fontSize: 9,
                    }}
                  >
                    {p.name}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 8,
                      letterSpacing: "0.15em",
                      color: "#6B6B6B",
                    }}
                  >
                    Paid
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#1B2A4A" }}
                    data-testid={`paid-amount-${p.id}`}
                  >
                    €{bal.paid.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                  {/* Owes / Is owed only when there's real data. Empty state
                      keeps each card to a single €0 line per the spec. */}
                  {hasExpenses ? (
                    owes ? (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#CC2E2C" }}>
                        Owes €{Math.abs(bal.net).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    ) : owed ? (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#4A7C3E" }}>
                        Is owed €{bal.net.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#6B6B6B" }}>Settled</span>
                    )
                  ) : null}
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#6B6B6B" }}>{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SETTLE UP */}
        <SettleUpCard debt={debt} onMarkSettled={handleMarkSettled} />

        {/* RECENT */}
        <div
          className="rounded-xl p-3.5 flex flex-col gap-2"
          style={{ background: "#F5F1E8", border: "1px solid #E5DFD0" }}
          data-testid="recent-card"
        >
          <span
            style={{ fontFamily: "var(--font-display)", color: "#6B6B6B", fontSize: 10, letterSpacing: "0.18em" }}
          >
            RECENT
          </span>
          {recent.length > 0 ? (
            <>
              {recent.map((r) => {
                const cat = resolveCategory(r.category);
                const payer = PERSON_BY_ID[resolvePayer(r.paid_by)];
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-2.5 py-1.5"
                    data-testid={`recent-item-${r.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate"
                        style={{ fontSize: 12, fontWeight: 600, color: "#1B2A4A" }}
                      >
                        {cat.emoji}  {r.description}
                      </p>
                      <p style={{ fontSize: 10, color: "#6B6B6B" }}>
                        {payer.name} · {formatRelative(r.created_at)}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1B2A4A" }}>
                      €{r.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                );
              })}
              {recentCount >= 5 ? (
                <button
                  type="button"
                  style={{ color: "#1E4D92", fontSize: 12, fontWeight: 600, textAlign: "center" }}
                  data-testid="see-all-link"
                >
                  See all {recentCount} →
                </button>
              ) : null}
            </>
          ) : (
            <p
              data-testid="recent-empty"
              style={{
                fontSize: 12,
                color: "#6B6B6B",
                fontStyle: "italic",
                textAlign: "center",
                padding: "8px 0",
              }}
            >
              No transactions yet.
            </p>
          )}
        </div>

        {/* ADD EXPENSE */}
        <button
          type="button"
          className="h-11 rounded-full flex items-center justify-center active:scale-[0.98] transition-transform"
          style={{
            background: "#CC2E2C",
            color: "#FFD23F",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.12em",
          }}
          data-testid="add-expense-btn"
        >
          + ADD EXPENSE
        </button>

        {/* Debug: render summarized settlements for tests / future UI */}
        <span className="sr-only" data-testid="settlements-count">
          {settlements.length}
        </span>

        {/* Tiny helpers so admins can see all balances mid-trip */}
        <span className="sr-only" data-testid="balances-json">
          {JSON.stringify(balances)}
        </span>
      </div>
    </div>
  );
}

// Lightweight relative-time used by RECENT rows. Keeps the card dense
// while avoiding a dependency on a date library.
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const hours = diff / 3600_000;
  if (hours < 1) return "Just now";
  if (hours < 24) return `Today, ${new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (hours < 48) return "Yesterday";
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
