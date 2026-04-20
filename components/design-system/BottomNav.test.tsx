import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav, DEFAULT_TABS } from "./BottomNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("<BottomNav />", () => {
  it("renders the 5 default tabs in order (Home first)", () => {
    render(<BottomNav />);
    const nav = screen.getByTestId("bottom-nav");
    const labels = Array.from(nav.querySelectorAll("a")).map((a) => a.textContent);
    expect(labels).toEqual(DEFAULT_TABS.map((t) => t.label));
    expect(labels[0]).toBe("Home");
  });

  it("marks the matching tab active via aria-current and data-active", () => {
    render(<BottomNav />);
    const today = screen.getByTestId("bottom-nav-tab-today");
    expect(today).toHaveAttribute("aria-current", "page");
    expect(today).toHaveAttribute("data-active", "true");

    const bookings = screen.getByTestId("bottom-nav-tab-bookings");
    expect(bookings).toHaveAttribute("data-active", "false");
    const home = screen.getByTestId("bottom-nav-tab-home");
    expect(home).toHaveAttribute("data-active", "false");
  });

  it("respects activeHref override", () => {
    render(<BottomNav activeHref="/expenses" />);
    expect(screen.getByTestId("bottom-nav-tab-expenses")).toHaveAttribute("data-active", "true");
    expect(screen.getByTestId("bottom-nav-tab-today")).toHaveAttribute("data-active", "false");
    expect(screen.getByTestId("bottom-nav-tab-home")).toHaveAttribute("data-active", "false");
  });

  it("Home tab points at /home", () => {
    render(<BottomNav />);
    const home = screen.getByTestId("bottom-nav-tab-home");
    expect(home).toHaveAttribute("href", "/home");
  });
});
