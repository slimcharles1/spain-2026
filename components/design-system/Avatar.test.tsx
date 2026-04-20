import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("<Avatar />", () => {
  it("renders color-only circle when size < 48", () => {
    render(<Avatar person="ang" size={32} />);
    const a = screen.getByTestId("avatar");
    expect(a).toHaveAttribute("data-show-name", "false");
    expect(a.textContent).toBe("");
  });

  it("renders full first name when size >= 48", () => {
    render(<Avatar person="charles" size={64} />);
    const a = screen.getByTestId("avatar");
    expect(a).toHaveAttribute("data-show-name", "true");
    expect(a).toHaveTextContent("Charles");
  });

  it("respects showName override regardless of size", () => {
    render(<Avatar person="tony" size={24} showName />);
    const a = screen.getByTestId("avatar");
    expect(a).toHaveAttribute("data-show-name", "true");
    expect(a).toHaveTextContent("Tony");
  });

  it("applies the per-person token color", () => {
    render(<Avatar person="carly" size={48} />);
    expect(screen.getByTestId("avatar")).toHaveStyle({ background: "rgb(227, 122, 90)" });
  });

  it("labels itself with the person's full name for a11y", () => {
    render(<Avatar person="ang" size={24} />);
    expect(screen.getByTestId("avatar")).toHaveAttribute("aria-label", "Ang");
  });
});
