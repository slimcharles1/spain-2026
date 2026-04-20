import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChangeOpenCard } from "./ChangeOpenCard";
import type { Change } from "@/lib/changes-data";

const fixture: Change = {
  id: "mercado-san-miguel",
  status: "open",
  title: "Mercado de San Miguel — keep, label, or swap?",
  why: "Flagged as a tourist trap by a local UX reviewer. Cheaper, more local markets exist within a 15-minute walk.",
  options: [
    "Keep as-is",
    "Keep + add 'go early' micro-copy",
    "Swap to Mercado de Antón Martín",
  ],
  linearId: "NEG-62",
};

describe("<ChangeOpenCard />", () => {
  it("renders title, why, and all options from fixture data", () => {
    render(<ChangeOpenCard change={fixture} />);
    expect(screen.getByTestId("change-open-card-title")).toHaveTextContent(
      fixture.title
    );
    expect(screen.getByTestId("change-open-card-why")).toHaveTextContent(
      /tourist trap/i
    );
    const optionsList = screen.getByTestId("change-open-card-options");
    const items = optionsList.querySelectorAll("li");
    expect(items).toHaveLength(fixture.options!.length);
    expect(items[0]).toHaveTextContent("Keep as-is");
  });

  it("shows the NEEDS INPUT badge", () => {
    render(<ChangeOpenCard change={fixture} />);
    expect(screen.getByTestId("change-open-card-badge")).toHaveTextContent(
      "NEEDS INPUT"
    );
  });

  it("renders a Decide link to the Linear ticket that opens in a new tab", () => {
    render(<ChangeOpenCard change={fixture} />);
    const cta = screen.getByTestId("change-open-card-cta");
    expect(cta).toHaveAttribute(
      "href",
      "https://linear.app/negativespace/issue/NEG-62"
    );
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("omits the CTA when there is no linearId", () => {
    const { linearId: _ignored, ...rest } = fixture;
    void _ignored;
    render(<ChangeOpenCard change={rest as Change} />);
    expect(screen.queryByTestId("change-open-card-cta")).toBeNull();
  });
});
