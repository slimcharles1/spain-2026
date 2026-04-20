/**
 * Render tests for /home (NEG-73).
 *
 * The page greets the current user, shows a directory of four sections,
 * and a HOW THIS WORKS tip list. Persona is supplied via localStorage +
 * the auth_present cookie so the <AuthProvider> treats us as authed.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import HomePage from "@/app/home/page";
import { AuthProvider } from "@/lib/auth-context";
import { openChanges, CHANGES } from "@/lib/changes-data";
import { tripDays } from "@/lib/schedule-data";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function mountAsCarly() {
  // Simulate the authed + persona-ed state the real dispatcher guards.
  document.cookie = "trip_auth_present=1";
  window.localStorage.setItem("spain_persona", "carly");
  return render(
    <AuthProvider initialAuthed>
      <HomePage />
    </AuthProvider>
  );
}

describe("<HomePage />", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Clear cookies between tests.
    document.cookie = "trip_auth_present=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });

  it("renders the SPAIN / 2026 wordmark hero", () => {
    mountAsCarly();
    expect(screen.getByTestId("home-wordmark")).toHaveTextContent("SPAIN");
    expect(screen.getByTestId("home-hero")).toHaveTextContent("2026");
  });

  it("greets the current user by first name", () => {
    mountAsCarly();
    // Either "Day X of 7" (during trip) or "Trip starts in N days" (pre-trip).
    expect(screen.getByTestId("home-greeting")).toHaveTextContent(/^Hola, Carly\. /);
  });

  it("renders a DIRECTORY with four rows", () => {
    mountAsCarly();
    const directory = screen.getByTestId("home-directory");
    expect(within(directory).getByTestId("home-directory-today")).toHaveAttribute(
      "href",
      "/schedule"
    );
    expect(
      within(directory).getByTestId("home-directory-bookings")
    ).toHaveAttribute("href", "/bookings");
    expect(
      within(directory).getByTestId("home-directory-expenses")
    ).toHaveAttribute("href", "/expenses");
    expect(
      within(directory).getByTestId("home-directory-changes")
    ).toHaveAttribute("href", "/changes");
  });

  it("shows the count of bookings on the Bookings row", () => {
    mountAsCarly();
    const expected = tripDays
      .flatMap((d) => d.events)
      .filter((e) => !!e.confirmation).length;
    expect(
      screen.getByTestId("home-directory-bookings")
    ).toHaveTextContent(`${expected} confirmations`);
  });

  it("shows the count of open decisions on the Changes row", () => {
    mountAsCarly();
    const expected = openChanges(CHANGES).length;
    const suffix = expected === 1 ? "decision" : "decisions";
    expect(
      screen.getByTestId("home-directory-changes")
    ).toHaveTextContent(`${expected} open ${suffix}`);
  });

  it('shows a "Next up:" subtitle on the Today row', () => {
    mountAsCarly();
    expect(
      screen.getByTestId("home-directory-today")
    ).toHaveTextContent(/Next up: /);
  });

  it("renders the HOW THIS WORKS tip list", () => {
    mountAsCarly();
    const how = screen.getByTestId("home-how-it-works");
    expect(how).toHaveTextContent(/HOW THIS WORKS/i);
    // Four baked-in tip labels.
    expect(how).toHaveTextContent("ONE TAP");
    expect(how).toHaveTextContent("LIVE");
    expect(how).toHaveTextContent("OFFLINE");
    expect(how).toHaveTextContent("DECIDE");
  });

  it("falls back gracefully when there is no current user", () => {
    // No persona written; AuthProvider treats us as authed for render only.
    document.cookie = "trip_auth_present=1";
    render(
      <AuthProvider initialAuthed>
        <HomePage />
      </AuthProvider>
    );
    expect(screen.getByTestId("home-greeting")).toHaveTextContent(/^Hola, traveler\. /);
  });
});
