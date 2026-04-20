import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("<Button />", () => {
  it("defaults to the primary variant", () => {
    render(<Button>Book it</Button>);
    const btn = screen.getByTestId("button");
    expect(btn).toHaveAttribute("data-variant", "primary");
    expect(btn).toHaveTextContent("Book it");
  });

  it.each(["primary", "secondary", "outline", "dark"] as const)(
    "renders variant=%s",
    (variant) => {
      render(<Button variant={variant}>Go</Button>);
      expect(screen.getByTestId("button")).toHaveAttribute("data-variant", variant);
    },
  );

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tap</Button>);
    fireEvent.click(screen.getByTestId("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Tap
      </Button>,
    );
    fireEvent.click(screen.getByTestId("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("defaults type to 'button' to avoid accidental form submits", () => {
    render(<Button>Go</Button>);
    expect(screen.getByTestId("button")).toHaveAttribute("type", "button");
  });
});
