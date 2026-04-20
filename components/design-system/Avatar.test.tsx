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
    render(<Avatar person="ang" size={64} />);
    const a = screen.getByTestId("avatar");
    expect(a).toHaveAttribute("data-show-name", "true");
    expect(a).toHaveTextContent("Ang");
  });

  it("renders Charles as initials 'CJ' to fit the 64px circle", () => {
    render(<Avatar person="charles" size={64} />);
    const a = screen.getByTestId("avatar");
    expect(a).toHaveAttribute("data-show-name", "true");
    expect(a.textContent).toBe("CJ");
    // Full name still preserved for a11y.
    expect(a).toHaveAttribute("aria-label", "Charles");
  });

  it("renders Carly's first name when visible", () => {
    render(<Avatar person="carly" size={48} />);
    expect(screen.getByTestId("avatar")).toHaveTextContent("Carly");
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
