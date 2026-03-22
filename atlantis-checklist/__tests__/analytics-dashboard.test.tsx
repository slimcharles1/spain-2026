import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import AnalyticsDashboard from "@/app/analytics/page";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  getSupabase: () => null,
}));

// Mock analytics
jest.mock("@/lib/analytics", () => ({
  eventsToCSV: jest.fn(() => "header\nrow"),
  trackClick: jest.fn(),
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
}));

// Mock sessionStorage
const sessionStore: Record<string, string> = {};
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: (key: string) => sessionStore[key] ?? null,
    setItem: (key: string, value: string) => { sessionStore[key] = value; },
    removeItem: (key: string) => { delete sessionStore[key]; },
  },
  writable: true,
});

beforeEach(() => {
  for (const key of Object.keys(sessionStore)) delete sessionStore[key];
});

describe("Analytics Dashboard - PIN Gate", () => {
  it("shows PIN input when not authenticated", () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText("Enter PIN to access")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("PIN")).toBeInTheDocument();
    expect(screen.getByText("Unlock")).toBeInTheDocument();
  });

  it("shows error on wrong PIN", () => {
    render(<AnalyticsDashboard />);
    const input = screen.getByPlaceholderText("PIN");
    fireEvent.change(input, { target: { value: "0000" } });
    fireEvent.click(screen.getByText("Unlock"));
    expect(screen.getByText("Wrong PIN")).toBeInTheDocument();
  });

  it("unlocks with correct PIN", () => {
    render(<AnalyticsDashboard />);
    const input = screen.getByPlaceholderText("PIN");
    fireEvent.change(input, { target: { value: "6212" } });
    fireEvent.click(screen.getByText("Unlock"));
    // Should now show the dashboard header
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.queryByText("Enter PIN to access")).not.toBeInTheDocument();
  });

  it("persists auth in sessionStorage", () => {
    render(<AnalyticsDashboard />);
    const input = screen.getByPlaceholderText("PIN");
    fireEvent.change(input, { target: { value: "6212" } });
    fireEvent.click(screen.getByText("Unlock"));
    expect(sessionStore["atlantis-admin-pin"]).toBe("6212");
  });

  it("auto-unlocks if sessionStorage has correct PIN", () => {
    sessionStore["atlantis-admin-pin"] = "6212";
    render(<AnalyticsDashboard />);
    // Should show dashboard directly, not PIN screen
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.queryByText("Enter PIN to access")).not.toBeInTheDocument();
  });

  it("shows dashboard tabs after unlock", () => {
    sessionStore["atlantis-admin-pin"] = "6212";
    render(<AnalyticsDashboard />);
    expect(screen.getByText("users")).toBeInTheDocument();
    expect(screen.getByText("events")).toBeInTheDocument();
    expect(screen.getByText("stream")).toBeInTheDocument();
  });

  it("shows stats counters after unlock", () => {
    sessionStore["atlantis-admin-pin"] = "6212";
    render(<AnalyticsDashboard />);
    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
  });

  it("unlocks via Enter key", () => {
    render(<AnalyticsDashboard />);
    const input = screen.getByPlaceholderText("PIN");
    fireEvent.change(input, { target: { value: "6212" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.queryByText("Enter PIN to access")).not.toBeInTheDocument();
  });
});
