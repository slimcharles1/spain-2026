import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DayPill } from "./DayPill";

describe("<DayPill />", () => {
  it("renders day number and weekday", () => {
    render(<DayPill dayNumber={3} dayOfWeek="Sun" />);
    const pill = screen.getByTestId("day-pill");
    expect(pill).toHaveTextContent("Sun");
    expect(pill).toHaveTextContent("3");
  });

  it("exposes selected state via aria-pressed and data-selected", () => {
    const { rerender } = render(<DayPill dayNumber={1} dayOfWeek="Fri" />);
    const pill = screen.getByTestId("day-pill");
    expect(pill).toHaveAttribute("aria-pressed", "false");
    expect(pill).toHaveAttribute("data-selected", "false");

    rerender(<DayPill dayNumber={1} dayOfWeek="Fri" selected />);
    expect(screen.getByTestId("day-pill")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("day-pill")).toHaveAttribute("data-selected", "true");
  });

  it("fires onClick when pressed", () => {
    const onClick = vi.fn();
    render(<DayPill dayNumber={2} dayOfWeek="Sat" onClick={onClick} />);
    fireEvent.click(screen.getByTestId("day-pill"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("builds a descriptive default aria-label", () => {
    render(<DayPill dayNumber={5} dayOfWeek="Tue" />);
    expect(screen.getByTestId("day-pill")).toHaveAccessibleName("Day 5 (Tue)");
  });
});
