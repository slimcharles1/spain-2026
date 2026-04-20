import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Illustration } from "./Illustration";
import { eventTypes } from "@/lib/design-tokens";

describe("<Illustration />", () => {
  it.each(
    (Object.keys(eventTypes) as (keyof typeof eventTypes)[]).map((t) => [t]),
  )("renders type=%s with its token emoji", (type) => {
    render(<Illustration type={type} />);
    const el = screen.getByTestId("illustration");
    expect(el).toHaveAttribute("data-type", type);
    expect(screen.getByTestId("illustration-glyph")).toHaveTextContent(eventTypes[type].emoji);
  });

  it("applies a 135deg gradient driven by the event type's light+base tokens", () => {
    render(<Illustration type="dining" />);
    const el = screen.getByTestId("illustration");
    const bg = (el as HTMLElement).style.background;
    expect(bg).toContain("linear-gradient(135deg");
    // jsdom normalizes hex → rgb. Dining: light #FCEDD8 / base #E8A94F.
    expect(bg).toContain("rgb(252, 237, 216)");
    expect(bg).toContain("rgb(232, 169, 79)");
  });

  it("supports an emoji override", () => {
    const override = "\u{1F3A8}"; // palette emoji
    render(<Illustration type="culture" emoji={override} />);
    expect(screen.getByTestId("illustration-glyph")).toHaveTextContent(override);
  });

  it("accepts a size prop", () => {
    render(<Illustration type="sport" size={120} />);
    expect(screen.getByTestId("illustration")).toHaveStyle({ width: "120px", height: "120px" });
  });
});
