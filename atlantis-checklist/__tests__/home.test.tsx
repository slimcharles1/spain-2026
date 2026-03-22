import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("next/link", () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  );
});

jest.mock("@/lib/analytics", () => ({
  trackClick: jest.fn(),
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
}));

window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = jest.fn();

describe("Home / Landing Page", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the hero title and subtitle", () => {
    render(<Home />);
    expect(screen.getByText("Atlantis Bahamas")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("renders both family badges", () => {
    render(<Home />);
    expect(screen.getByText("Charly")).toBeInTheDocument();
    expect(screen.getByText("Ganks")).toBeInTheDocument();
  });

  it("renders all 4 navigation cards", () => {
    render(<Home />);
    expect(screen.getByText("Packing List")).toBeInTheDocument();
    expect(screen.getByText("Master Tab")).toBeInTheDocument();
    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Guide & Map")).toBeInTheDocument();
  });

  it("links cards to correct routes", () => {
    render(<Home />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/checklist");
    expect(hrefs).toContain("/expenses");
    expect(hrefs).toContain("/schedule");
    expect(hrefs).toContain("/guide");
  });

  it("renders the concierge button", () => {
    render(<Home />);
    expect(screen.getByText("Atlantis Concierge")).toBeInTheDocument();
  });

  it("renders the footer credit in lowercase", () => {
    render(<Home />);
    expect(screen.getByText("built by negative space llc")).toBeInTheDocument();
  });

  it("shows loading phase when concierge is clicked", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Atlantis Concierge"));
    expect(screen.getByText("Connecting to Atlantis Concierge...")).toBeInTheDocument();
  });

  it("transitions to rick roll reveal after delay", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Atlantis Concierge"));
    act(() => { jest.advanceTimersByTime(2500); });
    expect(screen.getByText("You've been reef-rolled!")).toBeInTheDocument();
    const img = screen.getByAltText("Rick Astley dancing");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("tenor.com");
  });

  it("transitions to gotcha phase with working GIF", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Atlantis Concierge"));
    act(() => { jest.advanceTimersByTime(2500); });
    fireEvent.click(screen.getByText(/I deserved that/));
    expect(screen.getByText("Really? That gullible?")).toBeInTheDocument();
    const img = screen.getByAltText("It's a trap!");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("giphy.com");
  });

  it("closes modal on final dismiss", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Atlantis Concierge"));
    act(() => { jest.advanceTimersByTime(2500); });
    fireEvent.click(screen.getByText(/I deserved that/));
    fireEvent.click(screen.getByText(/OK I'm done/));
    expect(screen.queryByText("Really? That gullible?")).not.toBeInTheDocument();
  });
});
