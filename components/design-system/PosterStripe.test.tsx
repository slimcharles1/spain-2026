import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PosterStripe } from "./PosterStripe";
import { posterStripe } from "@/lib/design-tokens";

describe("<PosterStripe />", () => {
  it("renders 4 color segments in canonical red/yellow/cobalt/pink order", () => {
    render(<PosterStripe />);
    const bar = screen.getByTestId("poster-stripe");
    const segs = Array.from(bar.children) as HTMLElement[];
    expect(segs).toHaveLength(4);
    expect(segs.map((s) => s.dataset.color)).toEqual(
      posterStripe.segments.map((s) => s.color),
    );
  });

  it("applies default 4px height and accepts override", () => {
    const { rerender } = render(<PosterStripe />);
    expect(screen.getByTestId("poster-stripe")).toHaveStyle({ height: "4px" });
    rerender(<PosterStripe height={8} />);
    expect(screen.getByTestId("poster-stripe")).toHaveStyle({ height: "8px" });
  });

  it("is aria-hidden (decorative)", () => {
    render(<PosterStripe />);
    expect(screen.getByTestId("poster-stripe")).toHaveAttribute("aria-hidden", "true");
  });
});
