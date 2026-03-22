import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import GuidePage from "@/app/guide/page";

jest.mock("@/lib/analytics", () => ({
  trackClick: jest.fn(),
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
}));

describe("Guide Page", () => {
  it("renders the header title", () => {
    render(<GuidePage />);
    // Use getAllByText since "Guide" appears in multiple places
    const headings = screen.getAllByText(/Guide/);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders all guide sections", () => {
    render(<GuidePage />);
    expect(screen.getByText("The Reef Overview")).toBeInTheDocument();
    expect(screen.getByText("Kid-Friendly Pools & Beaches")).toBeInTheDocument();
    expect(screen.getByText("Dining")).toBeInTheDocument();
    expect(screen.getByText("Activities with Toddlers")).toBeInTheDocument();
    expect(screen.getByText("Practical Tips")).toBeInTheDocument();
  });

  it("renders the embedded map iframe", () => {
    render(<GuidePage />);
    const iframe = document.querySelector('iframe[title="Atlantis Resort Map"]');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute("src")).toContain("maps.google.com");
  });

  it("renders Apple Maps and Google Maps direction buttons", () => {
    render(<GuidePage />);
    expect(screen.getByText("Apple Maps")).toBeInTheDocument();
    expect(screen.getByText("Google Maps")).toBeInTheDocument();
  });

  it("Apple Maps button links to maps.apple.com", () => {
    render(<GuidePage />);
    const link = screen.getByText("Apple Maps").closest("a");
    expect(link?.getAttribute("href")).toContain("maps.apple.com");
  });

  it("Google Maps button links to google.com/maps", () => {
    render(<GuidePage />);
    const link = screen.getByText("Google Maps").closest("a");
    expect(link?.getAttribute("href")).toContain("google.com/maps");
  });

  it("renders location pills", () => {
    render(<GuidePage />);
    expect(screen.getByText("The Reef")).toBeInTheDocument();
    expect(screen.getByText("Aquaventure")).toBeInTheDocument();
    expect(screen.getByText("Marina Village")).toBeInTheDocument();
  });

  it("renders inline direction links using Apple Maps", () => {
    render(<GuidePage />);
    const directionLinks = screen.getAllByText(/^Directions to /);
    expect(directionLinks.length).toBeGreaterThan(0);
    directionLinks.forEach((link) => {
      const anchor = link.closest("a");
      expect(anchor?.getAttribute("href")).toContain("maps.apple.com");
    });
  });

  it("renders hours badges", () => {
    render(<GuidePage />);
    const badges = screen.getAllByText(/Open \d|Shuttle runs|Dinner|Sessions/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it("collapses and expands sections", () => {
    render(<GuidePage />);
    expect(screen.getByText(/condo-style tower/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("The Reef Overview"));
    expect(screen.queryByText(/condo-style tower/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("The Reef Overview"));
    expect(screen.getByText(/condo-style tower/)).toBeInTheDocument();
  });
});
