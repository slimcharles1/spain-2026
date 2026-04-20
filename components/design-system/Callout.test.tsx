import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Callout } from "./Callout";

describe("<Callout />", () => {
  it("renders label and body", () => {
    render(<Callout variant="protip" label="PRO TIP" body="Arrive early" />);
    expect(screen.getByTestId("callout-label")).toHaveTextContent("PRO TIP");
    expect(screen.getByTestId("callout-body")).toHaveTextContent("Arrive early");
  });

  it.each(["protip", "advisory", "dresscode", "seating"] as const)(
    "renders variant=%s",
    (variant) => {
      render(<Callout variant={variant} label="X" body="y" />);
      expect(screen.getByTestId("callout")).toHaveAttribute("data-variant", variant);
    },
  );

  it("applies yellow surface + red label for protip", () => {
    render(<Callout variant="protip" label="PRO TIP" body="..." />);
    expect(screen.getByTestId("callout")).toHaveStyle({ background: "rgb(255, 210, 63)" });
    expect(screen.getByTestId("callout-label")).toHaveStyle({ background: "rgb(204, 46, 44)" });
  });

  it("applies cream surface + cobalt label for advisory", () => {
    render(<Callout variant="advisory" label="HEADS UP" body="..." />);
    expect(screen.getByTestId("callout")).toHaveStyle({ background: "rgb(245, 241, 232)" });
    expect(screen.getByTestId("callout-label")).toHaveStyle({ background: "rgb(30, 77, 146)" });
  });
});
