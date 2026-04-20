import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChangeDoneCard } from "./ChangeDoneCard";
import type { Change } from "@/lib/changes-data";

const fixture: Change = {
  id: "persistent-persona",
  status: "done",
  title: "Persona persists forever + tap-to-switch",
  why: "Was resetting at Madrid midnight.",
  decided: "Forever-sticky persona + tap small avatar top-right to switch",
  decidedAt: "2026-04-20",
  linearId: "NEG-71",
};

describe("<ChangeDoneCard />", () => {
  it("renders title and the decided rationale", () => {
    render(<ChangeDoneCard change={fixture} />);
    expect(screen.getByTestId("change-done-card-title")).toHaveTextContent(
      fixture.title
    );
    expect(screen.getByTestId("change-done-card-rationale")).toHaveTextContent(
      /forever-sticky persona/i
    );
  });

  it("shows the check mark", () => {
    render(<ChangeDoneCard change={fixture} />);
    expect(screen.getByTestId("change-done-card-check")).toHaveTextContent("✓");
  });

  it("formats the decided date", () => {
    render(<ChangeDoneCard change={fixture} />);
    // Locale 'en-US' with month: 'short' renders "Apr 20, 2026"
    expect(screen.getByTestId("change-done-card-date")).toHaveTextContent(
      "Apr 20, 2026"
    );
  });

  it("links to Linear with target=_blank", () => {
    render(<ChangeDoneCard change={fixture} />);
    const link = screen.getByTestId("change-done-card-link");
    expect(link).toHaveAttribute(
      "href",
      "https://linear.app/negativespace/issue/NEG-71"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("NEG-71");
  });

  it("falls back to why when no decided value is set", () => {
    const { decided: _ignored, ...rest } = fixture;
    void _ignored;
    render(<ChangeDoneCard change={rest as Change} />);
    expect(screen.getByTestId("change-done-card-rationale")).toHaveTextContent(
      fixture.why
    );
  });
});
