"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  PEOPLE,
  PERSON_BY_ID,
  type ExpenseRow,
  type LegacySplit,
  type PersonId,
} from "@/lib/expense-data";
import { readPersona } from "@/lib/persona-storage";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (row: ExpenseRow) => void;
}

const SPLIT_OPTIONS: Array<{ id: LegacySplit; label: string; sub: string }> = [
  { id: "50-50", label: "All 4", sub: "Split four ways" },
  { id: "cc-only", label: "Charles & Carly", sub: "Just CC" },
  { id: "ta-only", label: "Tony & Ang", sub: "Just TA" },
];

export default function AddExpenseModal({ open, onClose, onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("dining");
  const [paidBy, setPaidBy] = useState<PersonId>("charles");
  const [split, setSplit] = useState<LegacySplit>("50-50");
  const [submitting, setSubmitting] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Default paid_by to current persona on open, and reset other fields.
  useEffect(() => {
    if (!open) return;
    const persona = readPersona() ?? "charles";
    setPaidBy(persona);
    setAmount("");
    setDescription("");
    setCategory("dining");
    setSplit("50-50");
    setSubmitting(false);
    // Focus amount on next tick so the keyboard pops up on mobile.
    requestAnimationFrame(() => amountInputRef.current?.focus());
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Body scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const parsedAmount = useMemo(() => {
    const n = Number(amount.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
  }, [amount]);

  const canSubmit = parsedAmount !== null && description.trim().length > 0 && !submitting;

  const handleSubmit = useCallback(() => {
    if (!canSubmit || parsedAmount === null) return;
    setSubmitting(true);
    const row: ExpenseRow = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount: parsedAmount,
      description: description.trim(),
      category,
      paid_by: paidBy,
      split,
      created_at: new Date().toISOString(),
    };
    onSubmit(row);
  }, [canSubmit, parsedAmount, description, category, paidBy, split, onSubmit]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Add expense"
      data-testid="add-expense-modal"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        data-testid="add-expense-scrim"
      />
      <div
        className="relative w-full max-w-lg rounded-t-3xl overflow-hidden animate-slide-up flex flex-col"
        style={{
          background: "#F5F1E8",
          maxHeight: "92vh",
          border: "1px solid #1B2A4A",
        }}
      >
        {/* Handle row */}
        <div className="flex items-center justify-between px-4 pt-2">
          <div style={{ width: 28, height: 4 }} />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-2 w-9 rounded-full"
            style={{ background: "#D0CCBE" }}
            data-testid="add-expense-handle"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            data-testid="add-expense-close"
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "#F5F1E8", border: "1px solid #E5DFD0", color: "#1B2A4A" }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-2 pb-5 flex flex-col gap-4">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              color: "#1B2A4A",
              fontSize: 24,
              letterSpacing: "-0.01em",
            }}
          >
            ADD EXPENSE
          </h2>

          {/* Amount */}
          <label className="flex flex-col gap-1.5">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#6B6B6B",
              }}
            >
              AMOUNT
            </span>
            <div
              className="flex items-center rounded-xl"
              style={{ background: "#FFFFFF", border: "1px solid #E5DFD0", padding: "10px 14px" }}
            >
              <span style={{ color: "#6B6B6B", fontSize: 18, marginRight: 8 }}>€</span>
              <input
                ref={amountInputRef}
                inputMode="decimal"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                data-testid="add-expense-amount"
                className="flex-1 outline-none bg-transparent"
                style={{ color: "#1B2A4A", fontSize: 18, fontWeight: 600 }}
              />
            </div>
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1.5">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#6B6B6B",
              }}
            >
              DESCRIPTION
            </span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Tapas at Eslava"
              data-testid="add-expense-description"
              className="rounded-xl outline-none"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5DFD0",
                padding: "10px 14px",
                color: "#1B2A4A",
                fontSize: 14,
              }}
            />
          </label>

          {/* Category chips */}
          <div className="flex flex-col gap-1.5">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#6B6B6B",
              }}
            >
              CATEGORY
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const selected = c.id === category;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    data-testid={`add-expense-cat-${c.id}`}
                    aria-pressed={selected}
                    className="rounded-xl flex items-center gap-1.5"
                    style={{
                      background: selected ? c.color : "#FFFFFF",
                      border: `1px solid ${selected ? c.color : "#E5DFD0"}`,
                      color: selected ? "#FFFFFF" : "#1B2A4A",
                      padding: "8px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <span aria-hidden>{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid by */}
          <div className="flex flex-col gap-1.5">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#6B6B6B",
              }}
            >
              PAID BY
            </span>
            <div className="flex items-center gap-2">
              {PEOPLE.map((p) => {
                const selected = p.id === paidBy;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPaidBy(p.id)}
                    data-testid={`add-expense-payer-${p.id}`}
                    aria-pressed={selected}
                    aria-label={`Paid by ${p.name}`}
                    className="flex-1 flex flex-col items-center gap-1 rounded-xl"
                    style={{
                      background: selected ? "#FFFFFF" : "transparent",
                      border: `1px solid ${selected ? "#1B2A4A" : "#E5DFD0"}`,
                      padding: "8px 4px",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        background: p.bg,
                        color: p.fg,
                        border: p.stroke ? `1px solid ${p.stroke}` : undefined,
                        fontFamily: "var(--font-display)",
                        fontSize: 12,
                      }}
                    >
                      {p.initials}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#1B2A4A" }}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split */}
          <div className="flex flex-col gap-1.5">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#6B6B6B",
              }}
            >
              SPLIT
            </span>
            <div className="flex flex-col gap-1.5">
              {SPLIT_OPTIONS.map((s) => {
                const selected = s.id === split;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSplit(s.id)}
                    data-testid={`add-expense-split-${s.id}`}
                    aria-pressed={selected}
                    className="flex items-center justify-between rounded-xl"
                    style={{
                      background: selected ? "#1E4D92" : "#FFFFFF",
                      border: `1px solid ${selected ? "#1E4D92" : "#E5DFD0"}`,
                      padding: "10px 14px",
                      textAlign: "left",
                    }}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: selected ? "#FFD23F" : "#1B2A4A",
                        }}
                      >
                        {s.label}
                      </span>
                      <span style={{ fontSize: 11, color: selected ? "#F5F1E8" : "#6B6B6B" }}>
                        {s.sub}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="w-4 h-4 rounded-full"
                      style={{
                        background: selected ? "#FFD23F" : "#FFFFFF",
                        border: `2px solid ${selected ? "#FFD23F" : "#D0CCBE"}`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            data-testid="add-expense-submit"
            className="h-12 rounded-full flex items-center justify-center active:scale-[0.98] transition-transform mt-2"
            style={{
              background: canSubmit ? "#CC2E2C" : "#D0CCBE",
              color: "#FFD23F",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
              opacity: canSubmit ? 1 : 0.7,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "SAVING…" : `SAVE · ${PERSON_BY_ID[paidBy].name.toUpperCase()} PAID`}
          </button>
        </div>
      </div>
    </div>
  );
}
