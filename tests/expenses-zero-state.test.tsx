// NEG-75 — UI-level tests for the expenses zero state.
//
// Covers the rendering guarantees the ticket calls out:
// - All 4 PAID BY cards show €0 Paid when the table is empty
// - SETTLE UP shows "All squared up · nothing owed"
// - BY CATEGORY renders the empty-state line (no category bars)
// - RECENT renders the italic "No transactions yet." line
// - "See all N →" link is hidden when there are no transactions

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ExpensesView from "@/app/expenses/ExpensesView";
import SettleUpCard from "@/components/SettleUpCard";
import { PEOPLE } from "@/lib/expense-data";

describe("ExpensesView — empty state", () => {
  it("renders €0 Paid for every person", () => {
    render(<ExpensesView initialExpenses={[]} />);
    for (const p of PEOPLE) {
      const amount = screen.getByTestId(`paid-amount-${p.id}`);
      expect(amount.textContent).toBe("€0");
    }
  });

  it("renders the BY CATEGORY empty line and no category bars", () => {
    render(<ExpensesView initialExpenses={[]} />);
    expect(screen.getByTestId("category-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("cat-dining")).toBeNull();
    expect(screen.queryByTestId("cat-hotels")).toBeNull();
  });

  it("renders the RECENT empty line and hides the 'See all' link", () => {
    render(<ExpensesView initialExpenses={[]} />);
    expect(screen.getByTestId("recent-empty")).toBeInTheDocument();
    expect(screen.getByTestId("recent-empty").textContent).toBe("No transactions yet.");
    expect(screen.queryByTestId("see-all-link")).toBeNull();
  });

  it("shows TOTAL SPENT €0 and hero progress at 0%", () => {
    render(<ExpensesView initialExpenses={[]} />);
    expect(screen.getByTestId("total-spent").textContent).toBe("€0");
    const bar = screen.getByTestId("hero-progress") as HTMLElement;
    expect(bar.style.width).toBe("0%");
  });

  it("hides owes/owed lines on every PAID BY card", () => {
    render(<ExpensesView initialExpenses={[]} />);
    expect(screen.queryByText(/Owes €/)).toBeNull();
    expect(screen.queryByText(/Is owed €/)).toBeNull();
  });
});

describe("SettleUpCard — null debt", () => {
  it("renders 'All squared up · nothing owed' when debt is null", () => {
    render(<SettleUpCard debt={null} />);
    const body = screen.getByTestId("settle-up-body");
    expect(body.textContent).toBe("All squared up · nothing owed");
  });

  it("does not render a MARK SETTLED button when settled", () => {
    render(<SettleUpCard debt={null} />);
    expect(screen.queryByTestId("mark-settled-btn")).toBeNull();
  });
});
