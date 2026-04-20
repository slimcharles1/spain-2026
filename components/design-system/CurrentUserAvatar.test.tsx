import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CurrentUserAvatar } from "./CurrentUserAvatar";

// usePathname / useRouter are mocked per-test by swapping these module-scoped
// variables. Keeping them on the outside means one vi.mock call covers every
// case below.
let mockPathname = "/schedule";
const pushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: pushSpy }),
}));

// useAuth is mocked so the component renders without AuthProvider context.
let mockAuth: {
  isAuthed: boolean;
  currentUser: "ang" | "carly" | "charles" | "tony" | null;
} = { isAuthed: true, currentUser: "ang" };

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => mockAuth,
}));

describe("<CurrentUserAvatar />", () => {
  beforeEach(() => {
    mockPathname = "/schedule";
    mockAuth = { isAuthed: true, currentUser: "ang" };
    pushSpy.mockReset();
  });

  afterEach(() => {
    // Belt and suspenders — render trees from one test should not leak.
  });

  it("renders the current user's avatar inside a button on post-auth screens", () => {
    render(<CurrentUserAvatar />);
    const btn = screen.getByTestId("current-user-avatar");
    expect(btn.tagName).toBe("BUTTON");
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveAttribute("data-person", "ang");
    expect(avatar).toHaveAttribute("data-size", "28");
  });

  it("clicking the button routes to /persona", () => {
    render(<CurrentUserAvatar />);
    fireEvent.click(screen.getByTestId("current-user-avatar"));
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith("/persona");
  });

  it("renders nothing when the user is not authenticated", () => {
    mockAuth = { isAuthed: false, currentUser: null };
    const { container } = render(<CurrentUserAvatar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there is no current persona", () => {
    mockAuth = { isAuthed: true, currentUser: null };
    const { container } = render(<CurrentUserAvatar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is hidden on /login", () => {
    mockPathname = "/login";
    const { container } = render(<CurrentUserAvatar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is hidden on /persona so the picker owns the screen", () => {
    mockPathname = "/persona";
    const { container } = render(<CurrentUserAvatar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("reflects the persona that is currently active (carly)", () => {
    mockAuth = { isAuthed: true, currentUser: "carly" };
    render(<CurrentUserAvatar />);
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-person", "carly");
  });
});
