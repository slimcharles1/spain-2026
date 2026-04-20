import { describe, expect, it } from "vitest";
import {
  computeBalances,
  computeSettlements,
  resolveCategory,
  resolveConsumers,
  resolvePayer,
  sumByCategory,
  topDebt,
  totalSpent,
  type ExpenseRow,
} from "@/lib/expense-data";

const mkRow = (partial: Partial<ExpenseRow>): ExpenseRow => ({
  id: Math.random().toString(36).slice(2),
  amount: 0,
  description: "",
  category: "dining",
  paid_by: "charles",
  split: ["charles", "carly", "tony", "ang"],
  created_at: "2026-05-17T18:00:00Z",
  ...partial,
});

describe("computeBalances — equal 4-way split", () => {
  it("payer is owed (n-1)/n of the bill", () => {
    const rows = [mkRow({ amount: 100, paid_by: "charles" })];
    const balances = computeBalances(rows);
    const charles = balances.find((b) => b.id === "charles")!;
    expect(charles.paid).toBe(100);
    expect(charles.share).toBe(25);
    expect(charles.net).toBe(75);

    const othersOwe = balances.filter((b) => b.id !== "charles").every((b) => b.net === -25);
    expect(othersOwe).toBe(true);
  });

  it("all four paying the same amount nets to zero", () => {
    const rows: ExpenseRow[] = [
      mkRow({ amount: 40, paid_by: "charles" }),
      mkRow({ amount: 40, paid_by: "carly" }),
      mkRow({ amount: 40, paid_by: "tony" }),
      mkRow({ amount: 40, paid_by: "ang" }),
    ];
    const balances = computeBalances(rows);
    for (const b of balances) expect(b.net).toBe(0);
  });
});

describe("computeBalances — narrow splits", () => {
  it("guys-only split affects only guys", () => {
    const rows = [mkRow({ amount: 100, paid_by: "tony", split: ["charles", "tony"] })];
    const balances = computeBalances(rows);
    expect(balances.find((b) => b.id === "tony")!.net).toBe(50);
    expect(balances.find((b) => b.id === "charles")!.net).toBe(-50);
    expect(balances.find((b) => b.id === "carly")!.net).toBe(0);
    expect(balances.find((b) => b.id === "ang")!.net).toBe(0);
  });

  it("legacy 'cc-only' split resolves to Charles + Carly only", () => {
    const rows = [mkRow({ amount: 50, paid_by: "carly", split: "cc-only" })];
    const consumers = resolveConsumers(rows[0]);
    expect(consumers.sort()).toEqual(["carly", "charles"]);
    const balances = computeBalances(rows);
    expect(balances.find((b) => b.id === "carly")!.net).toBe(25);
    expect(balances.find((b) => b.id === "charles")!.net).toBe(-25);
    expect(balances.find((b) => b.id === "tony")!.net).toBe(0);
  });
});

describe("legacy couple-id payer resolution", () => {
  it("'cc' resolves to Charles, 'ta' to Tony", () => {
    expect(resolvePayer("cc")).toBe("charles");
    expect(resolvePayer("ta")).toBe("tony");
    expect(resolvePayer("ang")).toBe("ang");
  });
});

describe("resolveCategory", () => {
  it("maps legacy 'wine' to dining bucket", () => {
    expect(resolveCategory("wine").id).toBe("dining");
    expect(resolveCategory("transport").id).toBe("transit");
    expect(resolveCategory("shopping").id).toBe("other");
  });

  it("unknown category falls back to 'other'", () => {
    expect(resolveCategory("not-a-real-category").id).toBe("other");
  });
});

describe("computeSettlements — greedy min-transfer", () => {
  it("single debtor → single creditor produces one transfer", () => {
    const rows = [mkRow({ amount: 100, paid_by: "charles" })];
    const balances = computeBalances(rows);
    const settlements = computeSettlements(balances);
    expect(settlements).toHaveLength(3); // each other person owes charles
    expect(settlements.every((d) => d.to === "charles")).toBe(true);
    expect(settlements.reduce((s, d) => s + d.amount, 0)).toBe(75);
  });

  it("balanced scenario produces no settlements", () => {
    const rows: ExpenseRow[] = [
      mkRow({ amount: 40, paid_by: "charles" }),
      mkRow({ amount: 40, paid_by: "carly" }),
      mkRow({ amount: 40, paid_by: "tony" }),
      mkRow({ amount: 40, paid_by: "ang" }),
    ];
    const balances = computeBalances(rows);
    const settlements = computeSettlements(balances);
    expect(settlements).toHaveLength(0);
  });

  it("topDebt picks the largest transfer", () => {
    const rows: ExpenseRow[] = [
      mkRow({ amount: 200, paid_by: "tony" }),
      mkRow({ amount: 20, paid_by: "carly" }),
    ];
    const debt = topDebt(rows);
    expect(debt).not.toBeNull();
    expect(debt!.to).toBe("tony");
    expect(debt!.amount).toBeGreaterThan(0);
  });
});

describe("aggregates", () => {
  it("totalSpent sums every row", () => {
    const rows = [mkRow({ amount: 12.5 }), mkRow({ amount: 30 })];
    expect(totalSpent(rows)).toBe(42.5);
  });

  it("sumByCategory collapses legacy keys into 5 buckets", () => {
    const rows = [
      mkRow({ amount: 10, category: "dining" }),
      mkRow({ amount: 5, category: "wine" }),
      mkRow({ amount: 20, category: "hotels" }),
      mkRow({ amount: 15, category: "shopping" }),
    ];
    const sums = sumByCategory(rows);
    const dining = sums.find((s) => s.category.id === "dining")!;
    const other = sums.find((s) => s.category.id === "other")!;
    expect(dining.amount).toBe(15);
    expect(other.amount).toBe(15);
    expect(sums).toHaveLength(5);
  });
});
