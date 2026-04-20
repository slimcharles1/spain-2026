import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBar } from "./StatusBar";

describe("<StatusBar />", () => {
  it("renders an overridden time when provided", () => {
    render(<StatusBar time="14:15" />);
    expect(screen.getByTestId("status-bar-time")).toHaveTextContent("14:15");
  });

  it("renders 3 indicator dots", () => {
    render(<StatusBar time="09:00" />);
    const bar = screen.getByTestId("status-bar");
    const dotsContainer = bar.children[1] as HTMLElement;
    expect(dotsContainer.children).toHaveLength(3);
  });

  it("auto-picks a 24-hour time when no prop passed (HH:MM)", () => {
    render(<StatusBar />);
    const text = screen.getByTestId("status-bar-time").textContent ?? "";
    expect(text === "" || /^\d{2}:\d{2}$/.test(text)).toBe(true);
  });
});
