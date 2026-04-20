import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("<Badge />", () => {
  it.each(["now", "next", "done"] as const)("renders default label for variant=%s", (variant) => {
    render(<Badge variant={variant} />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("data-variant", variant);
    expect(badge).toHaveTextContent(variant.toUpperCase());
  });

  it("accepts custom children as label override", () => {
    render(<Badge variant="now">LIVE</Badge>);
    expect(screen.getByTestId("badge")).toHaveTextContent("LIVE");
  });

  it("applies red bg for now/next and cream bg for done", () => {
    const { rerender } = render(<Badge variant="now" />);
    expect(screen.getByTestId("badge")).toHaveStyle({ background: "rgb(204, 46, 44)" });
    rerender(<Badge variant="done" />);
    expect(screen.getByTestId("badge")).toHaveStyle({ background: "rgb(245, 241, 232)" });
  });
});
