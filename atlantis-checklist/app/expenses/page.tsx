"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paid_by: "charly" | "ganks";
  split: "50-50" | "charly-only" | "ganks-only";
  photo_url: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: "dining", emoji: "🍽️", label: "Dining" },
  { id: "activities", emoji: "🎢", label: "Activities" },
  { id: "shopping", emoji: "🛍️", label: "Shopping" },
  { id: "transport", emoji: "🚕", label: "Transport" },
  { id: "tips", emoji: "💵", label: "Tips" },
  { id: "other", emoji: "📦", label: "Other" },
];

const STORAGE_KEY = "atlantis-expenses";

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveExpenses(expenses: Expense[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatMoney(n: number) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<Expense | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("dining");
  const [paidBy, setPaidBy] = useState<"charly" | "ganks">("charly");
  const [split, setSplit] = useState<"50-50" | "charly-only" | "ganks-only">("50-50");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExpenses(loadExpenses());
  }, []);

  useEffect(() => {
    if (expenses.length > 0) saveExpenses(expenses);
  }, [expenses]);

  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const addExpense = useCallback(() => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !description.trim()) return;

    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: amt,
      description: description.trim(),
      category,
      paid_by: paidBy,
      split,
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
    };

    setExpenses((prev) => [expense, ...prev]);
    resetForm();
  }, [amount, description, category, paidBy, split, photoUrl]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveExpenses(next);
      return next;
    });
    setShowDetail(null);
  }, []);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("dining");
    setPaidBy("charly");
    setSplit("50-50");
    setPhotoUrl(null);
    setShowForm(false);
  };

  // Settlement math
  const settlement = expenses.reduce(
    (acc, e) => {
      if (e.split === "50-50") {
        const half = e.amount / 2;
        if (e.paid_by === "charly") {
          acc.charlyPaid += e.amount;
          acc.ganksOwe += half;
        } else {
          acc.ganksPaid += e.amount;
          acc.charlyOwe += half;
        }
      } else if (e.split === "charly-only") {
        acc.charlyPaid += e.paid_by === "charly" ? e.amount : 0;
        if (e.paid_by === "ganks") acc.charlyOwe += e.amount;
      } else if (e.split === "ganks-only") {
        acc.ganksPaid += e.paid_by === "ganks" ? e.amount : 0;
        if (e.paid_by === "charly") acc.ganksOwe += e.amount;
      }
      acc.total += e.amount;
      return acc;
    },
    { total: 0, charlyPaid: 0, ganksPaid: 0, charlyOwe: 0, ganksOwe: 0 }
  );

  const netBalance = settlement.ganksOwe - settlement.charlyOwe;

  const getCategoryEmoji = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.emoji ?? "📦";

  return (
    <div className="min-h-screen font-body">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-ocean-950 to-ocean-900 pb-4 shadow-lg shadow-ocean-950/50">
        <div className="px-5 pt-10 pb-2 text-center">
          <h1 className="font-display text-3xl bg-gradient-to-r from-gold via-coral to-pink bg-clip-text text-transparent">
            Master Tab
          </h1>
          <p className="text-white/50 text-sm mt-1 tracking-wide">
            Charly &amp; Ganks
          </p>
        </div>

        {/* Settlement banner */}
        <div className="mx-5 mt-3 bg-ocean-800/80 rounded-2xl p-4 border border-white/5">
          <div className="flex justify-between text-xs text-white/50 mb-2">
            <span>Total spent</span>
            <span className="text-white font-semibold text-sm">
              {formatMoney(settlement.total)}
            </span>
          </div>
          <div className="flex gap-3 text-xs mb-3">
            <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center">
              <div className="text-coral font-bold text-sm">
                {formatMoney(settlement.charlyPaid)}
              </div>
              <div className="text-white/40 mt-0.5">Charly paid</div>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center">
              <div className="text-gold font-bold text-sm">
                {formatMoney(settlement.ganksPaid)}
              </div>
              <div className="text-white/40 mt-0.5">Ganks paid</div>
            </div>
          </div>
          {expenses.length > 0 && (
            <div
              className={`text-center text-sm font-semibold py-2 rounded-xl ${
                netBalance > 0
                  ? "bg-gold/10 text-gold"
                  : netBalance < 0
                  ? "bg-coral/10 text-coral"
                  : "bg-mint/10 text-mint"
              }`}
            >
              {netBalance > 0
                ? `Ganks owe Charly ${formatMoney(netBalance)}`
                : netBalance < 0
                ? `Charly owes Ganks ${formatMoney(Math.abs(netBalance))}`
                : "All settled up!"}
            </div>
          )}
        </div>
      </div>

      {/* Expense list */}
      <div className="px-4 py-4 space-y-2">
        {expenses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-white/30 text-sm">No expenses yet</p>
            <p className="text-white/20 text-xs mt-1">
              Tap + to log your first expense
            </p>
          </div>
        )}

        {expenses.map((e) => (
          <button
            key={e.id}
            onClick={() => setShowDetail(e)}
            className="w-full flex items-center gap-3 bg-ocean-800/60 rounded-2xl p-3.5 border border-white/5 text-left hover:bg-ocean-800/80 transition-colors"
          >
            {e.photo_url ? (
              <img
                src={e.photo_url}
                alt=""
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                {getCategoryEmoji(e.category)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {e.description}
              </div>
              <div className="text-white/40 text-xs mt-0.5">
                {e.paid_by === "charly" ? "Charly" : "Ganks"} paid
                {e.split === "50-50" ? " · Split" : e.split === "charly-only" ? " · Charly only" : " · Ganks only"}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-white font-semibold text-sm">
                {formatMoney(e.amount)}
              </div>
              <div
                className={`text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${
                  e.paid_by === "charly"
                    ? "bg-coral/15 text-coral"
                    : "bg-gold/15 text-gold"
                }`}
              >
                {e.paid_by === "charly" ? "C" : "G"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-gradient-to-br from-coral to-pink rounded-full flex items-center justify-center shadow-lg shadow-coral/30 hover:scale-105 active:scale-95 transition-transform"
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add expense form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-ocean-900 rounded-t-3xl w-full max-w-lg border-t border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-white font-display text-xl">Add Expense</h3>
                <button
                  onClick={resetForm}
                  className="text-white/40 hover:text-white/70 p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/10 text-white text-lg rounded-xl px-3 pl-8 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">What was it for?</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dinner at Nobu, taxi, etc."
                  className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-3 placeholder-white/20 outline-none focus:ring-1 focus:ring-mint/50"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                        category === c.id
                          ? "bg-white/15 text-white ring-1 ring-mint/40"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Who paid */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Who paid?</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaidBy("charly")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      paidBy === "charly"
                        ? "bg-coral/20 text-coral ring-1 ring-coral/40"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    Charly
                  </button>
                  <button
                    onClick={() => setPaidBy("ganks")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      paidBy === "ganks"
                        ? "bg-gold/20 text-gold ring-1 ring-gold/40"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    Ganks
                  </button>
                </div>
              </div>

              {/* Split */}
              <div className="mb-4">
                <label className="text-white/50 text-xs font-medium block mb-1.5">How to split?</label>
                <div className="flex gap-2">
                  {[
                    { id: "50-50" as const, label: "50/50" },
                    { id: "charly-only" as const, label: "Charly only" },
                    { id: "ganks-only" as const, label: "Ganks only" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSplit(s.id)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        split === s.id
                          ? "bg-mint/20 text-mint ring-1 ring-mint/40"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div className="mb-6">
                <label className="text-white/50 text-xs font-medium block mb-1.5">Receipt photo (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhoto}
                  className="hidden"
                />
                {photoUrl ? (
                  <div className="relative">
                    <img src={photoUrl} alt="Receipt" className="w-full h-40 object-cover rounded-xl" />
                    <button
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-white/30 text-sm hover:border-white/20 hover:text-white/50 transition-colors"
                  >
                    📷 Tap to take or upload a photo
                  </button>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={addExpense}
                disabled={!amount || !description.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-coral to-pink text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense detail modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
          onClick={() => setShowDetail(null)}
        >
          <div
            className="bg-ocean-800 rounded-2xl p-5 max-w-sm w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {showDetail.photo_url && (
              <img
                src={showDetail.photo_url}
                alt="Receipt"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-white">
                {formatMoney(showDetail.amount)}
              </div>
              <div className="text-white/70 text-sm mt-1">
                {showDetail.description}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Category</span>
                <span className="text-white/80">
                  {getCategoryEmoji(showDetail.category)}{" "}
                  {CATEGORIES.find((c) => c.id === showDetail.category)?.label}
                </span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Paid by</span>
                <span
                  className={
                    showDetail.paid_by === "charly" ? "text-coral" : "text-gold"
                  }
                >
                  {showDetail.paid_by === "charly" ? "Charly" : "Ganks"}
                </span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Split</span>
                <span className="text-white/80">
                  {showDetail.split === "50-50"
                    ? "50/50"
                    : showDetail.split === "charly-only"
                    ? "Charly only"
                    : "Ganks only"}
                </span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Date</span>
                <span className="text-white/80">
                  {new Date(showDetail.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowDetail(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => deleteExpense(showDetail.id)}
                className="py-2.5 px-4 rounded-xl bg-coral/10 text-coral text-sm font-medium hover:bg-coral/20 transition-colors"
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
