"use client";

// Yellow SETTLE UP card — top debt + MARK SETTLED CTA (navy/gold).
// Matches Pencil node `Wep3t` inside G2Th2. When `debt` is null the card
// renders a settled-up state instead.

import type { CoupleDebt } from "@/lib/expense-data";
import { COUPLES } from "@/lib/expense-data";

interface Props {
  debt: CoupleDebt | null;
  onMarkSettled?: () => void;
}

export default function SettleUpCard({ debt, onMarkSettled }: Props) {
  if (!debt) {
    // NEG-75: green success card when there's nothing to settle (empty
    // table or all balances zeroed). Uses the success token (`#4A7C3E`)
    // as the card background per the zero-state spec.
    return (
      <div
        data-testid="settle-up-card"
        className="rounded-xl p-3.5"
        style={{ background: "#4A7C3E", color: "#FFFFFF" }}
      >
        <p
          className="text-[10px]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "#FFFFFF", opacity: 0.85 }}
        >
          SETTLED UP
        </p>
        <p
          className="text-[15px] font-bold mt-1"
          style={{ color: "#FFFFFF" }}
          data-testid="settle-up-body"
        >
          All squared up · nothing owed
        </p>
      </div>
    );
  }

  const from = COUPLES[debt.from];
  const to = COUPLES[debt.to];

  return (
    <div
      data-testid="settle-up-card"
      className="rounded-xl p-3.5 flex flex-col gap-2"
      style={{ background: "#FFD23F", color: "#1B2A4A" }}
    >
      <p
        className="text-[10px]"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "#CC2E2C" }}
      >
        SETTLE UP
      </p>
      <p
        className="text-[16px] font-bold leading-snug"
        style={{ fontFamily: "var(--font-body)", color: "#1B2A4A" }}
        data-testid="settle-up-body"
      >
        {from.label} owe {to.label} €{debt.amount.toFixed(0)}
      </p>
      <button
        data-testid="mark-settled-btn"
        onClick={onMarkSettled}
        className="h-10 rounded-lg active:scale-[0.98] transition-transform w-full"
        style={{
          background: "#1B2A4A",
          color: "#FFD23F",
          fontFamily: "var(--font-display)",
          letterSpacing: "0.1em",
          fontSize: 11,
        }}
      >
        MARK SETTLED
      </button>
    </div>
  );
}
