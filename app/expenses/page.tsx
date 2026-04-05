"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paid_by: "cc" | "ta";
  split: "50-50" | "cc-only" | "ta-only";
  created_at: string;
}

const STORAGE_KEY = "spain-expenses";
const COUPLE_NAMES = {
  cc: "Charles & Carly",
  ta: "Tony & Ang",
};

const CATEGORIES = [
  { id: "dining", emoji: "🍽️", label: "Dining" },
  { id: "wine", emoji: "🍷", label: "Wine/Drinks" },
  { id: "transport", emoji: "🚗", label: "Transport" },
  { id: "activities", emoji: "🎟️", label: "Activities" },
  { id: "shopping", emoji: "🛍️", label: "Shopping" },
  { id: "other", emoji: "📌", label: "Other" },
];

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function calculateSettlement(expenses: Expense[]): { owes: "cc" | "ta" | null; amount: number } {
  let ccPaidForTa = 0;
  let taPaidForCc = 0;

  for (const exp of expenses) {
    if (exp.split === "50-50") {
      const half = exp.amount / 2;
      if (exp.paid_by === "cc") ccPaidForTa += half;
      else taPaidForCc += half;
    } else if (exp.split === "cc-only" && exp.paid_by === "ta") {
      taPaidForCc += exp.amount;
    } else if (exp.split === "ta-only" && exp.paid_by === "cc") {
      ccPaidForTa += exp.amount;
    }
  }

  const net = ccPaidForTa - taPaidForCc;
  if (Math.abs(net) < 0.01) return { owes: null, amount: 0 };
  return net > 0 ? { owes: "ta", amount: net } : { owes: "cc", amount: Math.abs(net) };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<Expense | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("dining");
  const [paidBy, setPaidBy] = useState<"cc" | "ta">("cc");
  const [split, setSplit] = useState<"50-50" | "cc-only" | "ta-only">("50-50");
  const [descriptionError, setDescriptionError] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());

    // Supabase realtime
    const sb = getSupabase();
    if (!sb) return;

    sb.from("expenses").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setExpenses(data as Expense[]);
        saveExpenses(data as Expense[]);
      }
    });

    const channel = sb
      .channel("expenses-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "expenses" }, (payload) => {
        const row = payload.new as Expense;
        setExpenses((prev) => {
          if (prev.find((e) => e.id === row.id)) return prev;
          const next = [row, ...prev];
          saveExpenses(next);
          return next;
        });
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "expenses" }, (payload) => {
        const id = (payload.old as { id: string }).id;
        setExpenses((prev) => {
          const next = prev.filter((e) => e.id !== id);
          saveExpenses(next);
          return next;
        });
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, []);

  const addExpense = useCallback(() => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !description.trim()) {
      if (!description.trim()) setDescriptionError(true);
      return;
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: amt,
      description: description.trim(),
      category,
      paid_by: paidBy,
      split,
      created_at: new Date().toISOString(),
    };

    setExpenses((prev) => {
      const next = [expense, ...prev];
      saveExpenses(next);
      return next;
    });

    // Sync to Supabase
    const sb = getSupabase();
    if (sb) {
      sb.from("expenses").insert(expense).then(() => {});
    }

    setAmount("");
    setDescription("");
    setCategory("dining");
    setSplit("50-50");
    setShowForm(false);
  }, [amount, description, category, paidBy, split]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveExpenses(next);
      return next;
    });
    const sb = getSupabase();
    if (sb) {
      sb.from("expenses").delete().eq("id", id).then(() => {});
    }
    setShowDetail(null);
  }, []);

  const settlement = calculateSettlement(expenses);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1
          className="text-[28px] leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
        >
          Expenses
        </h1>

        {/* Settlement hero */}
        <div
          className="mt-4 p-4 rounded-2xl"
          style={{
            background: "var(--theme-card)",
            border: "1px solid var(--theme-border)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {settlement.owes ? (
            <>
              <p className="text-[13px]" style={{ color: "var(--theme-text-secondary)" }}>
                {COUPLE_NAMES[settlement.owes]} owe
              </p>
              <p className="text-[24px] font-bold mt-0.5" style={{ color: "var(--theme-text)", fontFamily: "var(--font-mono)" }}>
                €{settlement.amount.toFixed(2)}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
                ~${(settlement.amount * 1.08).toFixed(0)} USD
              </p>
            </>
          ) : (
            <p className="text-[16px] font-semibold" style={{ color: "#5D6D3F" }}>
              ✓ You&apos;re settled up!
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid var(--theme-border)" }}>
            <div>
              <span className="text-[11px]" style={{ color: "var(--theme-text-secondary)" }}>Total spent</span>
              <span className="text-[14px] font-bold ml-2" style={{ color: "var(--theme-text)", fontFamily: "var(--font-mono)" }}>
                €{total.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[11px]" style={{ color: "var(--theme-text-secondary)" }}>Entries</span>
              <span className="text-[14px] font-bold ml-2" style={{ color: "var(--theme-text)" }}>
                {expenses.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense list */}
      <div className="px-5 pb-24 space-y-2">
        {expenses.map((exp) => {
          const cat = CATEGORIES.find((c) => c.id === exp.category);
          return (
            <div
              key={exp.id}
              className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
              style={{
                background: "var(--theme-card)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
              onClick={() => setShowDetail(exp)}
            >
              <span className="text-lg">{cat?.emoji || "📌"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate" style={{ color: "var(--theme-text)" }}>
                  {exp.description}
                </p>
                <p className="text-[12px]" style={{ color: "var(--theme-text-secondary)" }}>
                  {COUPLE_NAMES[exp.paid_by]} · {exp.split}
                </p>
              </div>
              <span className="text-[15px] font-bold shrink-0" style={{ color: "var(--theme-text)", fontFamily: "var(--font-mono)" }}>
                €{exp.amount.toFixed(2)}
              </span>
            </div>
          );
        })}

        {expenses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[40px]">💶</p>
            <p className="text-[14px] mt-2" style={{ color: "var(--theme-text-secondary)" }}>
              No expenses yet. Tap + to add one.
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        style={{
          bottom: "calc(88px + env(safe-area-inset-bottom))",
          right: 20,
          background: "#C0392B",
        }}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add expense bottom sheet */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full rounded-t-3xl p-5 pb-8 animate-slide-up"
            style={{ background: "var(--theme-bg)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(27, 42, 74, 0.15)" }} />

            <h2 className="text-[20px] mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
              Add Expense
            </h2>

            {/* Amount */}
            <div className="mb-4">
              <label className="text-[12px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: "var(--theme-text-secondary)" }}>
                Amount (€)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl text-[18px] font-bold"
                style={{
                  background: "var(--theme-card)",
                  border: "1px solid var(--theme-border)",
                  color: "var(--theme-text)",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-[12px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: "var(--theme-text-secondary)" }}>
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (descriptionError) setDescriptionError(false);
                }}
                placeholder="What was it for?"
                className={`w-full px-4 py-3 rounded-xl text-[15px]${descriptionError ? " animate-shake" : ""}`}
                style={{
                  background: "var(--theme-card)",
                  border: descriptionError ? "1.5px solid #C0392B" : "1px solid var(--theme-border)",
                  color: "var(--theme-text)",
                }}
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="text-[12px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: "var(--theme-text-secondary)" }}>
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                    style={{
                      background: category === cat.id ? "var(--theme-text)" : "var(--theme-card)",
                      color: category === cat.id ? "var(--theme-bg)" : "var(--theme-text)",
                      border: category === cat.id ? "none" : "1px solid var(--theme-border)",
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paid by */}
            <div className="mb-4">
              <label className="text-[12px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: "var(--theme-text-secondary)" }}>
                Paid by
              </label>
              <div className="flex gap-2">
                {(["cc", "ta"] as const).map((couple) => (
                  <button
                    key={couple}
                    onClick={() => setPaidBy(couple)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                    style={{
                      background: paidBy === couple ? (couple === "cc" ? "#1B2A4A" : "#C0392B") : "var(--theme-card)",
                      color: paidBy === couple ? "white" : "var(--theme-text)",
                      border: paidBy === couple ? "none" : "1px solid var(--theme-border)",
                    }}
                  >
                    {COUPLE_NAMES[couple]}
                  </button>
                ))}
              </div>
            </div>

            {/* Split */}
            <div className="mb-6">
              <label className="text-[12px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: "var(--theme-text-secondary)" }}>
                Split
              </label>
              <div className="flex gap-2">
                {[
                  { value: "50-50" as const, label: "50/50" },
                  { value: "cc-only" as const, label: "C&C only" },
                  { value: "ta-only" as const, label: "T&A only" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSplit(opt.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                    style={{
                      background: split === opt.value ? "#D4A843" : "var(--theme-card)",
                      color: split === opt.value ? "#1B2A4A" : "var(--theme-text)",
                      border: split === opt.value ? "none" : "1px solid var(--theme-border)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={addExpense}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white transition-all active:scale-[0.98]"
              style={{ background: "#C0392B" }}
            >
              Add Expense
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setShowDetail(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative rounded-2xl p-5 w-full max-w-sm"
            style={{ background: "var(--theme-card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-semibold" style={{ color: "var(--theme-text)" }}>
              {showDetail.description}
            </h3>
            <p className="text-[24px] font-bold mt-2" style={{ color: "var(--theme-text)", fontFamily: "var(--font-mono)" }}>
              €{showDetail.amount.toFixed(2)}
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-[13px]" style={{ color: "var(--theme-text-secondary)" }}>
                Paid by: {COUPLE_NAMES[showDetail.paid_by]}
              </p>
              <p className="text-[13px]" style={{ color: "var(--theme-text-secondary)" }}>
                Split: {showDetail.split}
              </p>
              <p className="text-[13px]" style={{ color: "var(--theme-text-secondary)" }}>
                {CATEGORIES.find((c) => c.id === showDetail.category)?.emoji}{" "}
                {CATEGORIES.find((c) => c.id === showDetail.category)?.label}
              </p>
              <p className="text-[12px]" style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}>
                {new Date(showDetail.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowDetail(null)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold"
                style={{ background: "rgba(27, 42, 74, 0.06)", color: "var(--theme-text)" }}
              >
                Close
              </button>
              <button
                onClick={() => deleteExpense(showDetail.id)}
                className="py-2.5 px-4 rounded-xl text-[14px] font-semibold"
                style={{ background: "rgba(192, 57, 43, 0.1)", color: "#C0392B" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
