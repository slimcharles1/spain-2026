/**
 * Change of Plans — trip-level decisions (NEG-72).
 *
 * Static seed for v1. The `/changes` page reads this array directly, so
 * adding / updating an entry is the only edit required to change what
 * renders. Items are roughly newest-first within each status.
 *
 * Status values:
 *   - "open" — still being debated. Renders as a yellow `<ChangeOpenCard />`
 *     with a NEEDS INPUT badge and a list of options.
 *   - "done" — settled. Renders as a cream `<ChangeDoneCard />` with the
 *     chosen option, a short rationale, and the decided date.
 *
 * Optional `linearId` is the trip's Linear ticket for the decision; the
 * card turns it into an external link.
 */

export type ChangeStatus = "open" | "done";

export interface Change {
  id: string;
  status: ChangeStatus;
  title: string;
  /** Short explainer (2-3 sentences). */
  why: string;
  /** For open items — the options under debate. */
  options?: string[];
  /** For done items — the chosen option, surfaced prominently on the card. */
  decided?: string;
  /** For done items — ISO date (YYYY-MM-DD) the call was made. */
  decidedAt?: string;
  /** Optional Linear ticket ID, e.g. "NEG-62". */
  linearId?: string;
}

/**
 * Linear workspace slug for building ticket URLs. Issue URLs look like:
 * https://linear.app/negativespace/issue/NEG-62
 */
export const LINEAR_WORKSPACE = "negativespace";

export function linearUrl(linearId: string): string {
  return `https://linear.app/${LINEAR_WORKSPACE}/issue/${linearId}`;
}

export const CHANGES: Change[] = [
  // ===== OPEN =====
  {
    id: "mercado-san-miguel",
    status: "open",
    title: "Mercado de San Miguel — keep, label, or swap?",
    why: "Madrid-based UX reviewer flagged it as a tourist trap: iconic architecture but 40–60% price premium, 80%+ tourist clientele. Locals eat at Antón Martín, Cebada, or San Fernando instead.",
    options: [
      "Keep as-is (we want the iron-and-glass photo moment)",
      "Keep + add 'tourist-heavy — go early' micro-copy",
      "Swap to Mercado de Antón Martín (Lavapiés, more local, ~40% cheaper)",
      "Swap to Mercado de la Cebada (La Latina, actual neighborhood market)",
    ],
    linearId: "NEG-62",
  },

  // ===== DONE =====
  {
    id: "language-chrome",
    status: "done",
    title: "App chrome switched to English",
    why: "Spanish status pills were mixing registers; full English chrome while keeping Spanish for place names, food, and flavor phrases felt cleaner.",
    decided: "English chrome, Spanish content",
    decidedAt: "2026-04-19",
    linearId: "NEG-52",
  },
  {
    id: "avatars-full-names",
    status: "done",
    title: "Avatars → full first names at large sizes",
    why: "Two 'C' initials (Carly + Charles) collided. AP/CG/CJ/TP was considered, but full first names at ≥48px + color-only circles <48px won on readability.",
    decided: "Full first names ≥48px; color-only <48px",
    decidedAt: "2026-04-20",
    linearId: "NEG-57",
  },
  {
    id: "day2-guys-only",
    status: "done",
    title: "Day 2 split: only during the match",
    why: "Original design had 3+ hours of guys/girls split. Actual plan: everyone together except the match itself. Simpler attendee model per event.",
    decided: "splitGroup only on the 20:30 match + post-match bar",
    decidedAt: "2026-04-20",
    linearId: "NEG-58",
  },
  {
    id: "persistent-persona",
    status: "done",
    title: "Persona persists forever + tap-to-switch",
    why: "Was resetting at Madrid midnight — wrong for a 7-day trip where you just want to pick once. Plus no way to fix a fat-fingered selection.",
    decided: "Forever-sticky persona + tap small avatar top-right to switch",
    decidedAt: "2026-04-20",
    linearId: "NEG-71",
  },
];

export function openChanges(changes: Change[] = CHANGES): Change[] {
  return changes.filter((c) => c.status === "open");
}

export function doneChanges(changes: Change[] = CHANGES): Change[] {
  return changes.filter((c) => c.status === "done");
}
