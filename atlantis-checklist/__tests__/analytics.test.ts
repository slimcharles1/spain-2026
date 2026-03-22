import { getUserId, getUserName, setUserName, trackEvent, getAllEvents, clearEvents } from "@/lib/analytics";

// Mock localStorage
const store: Record<string, string> = {};
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { for (const key of Object.keys(store)) delete store[key]; },
    },
    writable: true,
  });
});

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
});

describe("Analytics", () => {
  it("generates a user ID on first call", () => {
    const id = getUserId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(10);
  });

  it("returns the same user ID on subsequent calls", () => {
    const id1 = getUserId();
    const id2 = getUserId();
    expect(id1).toBe(id2);
  });

  it("returns null for user name initially", () => {
    expect(getUserName()).toBeNull();
  });

  it("stores and retrieves user name", () => {
    setUserName("Charles");
    expect(getUserName()).toBe("Charles");
  });

  it("tracks events with all required fields", () => {
    clearEvents();
    trackEvent("test_event", { key: "value" }, "test_target");

    const events = getAllEvents();
    expect(events.length).toBe(1);

    const event = events[0];
    expect(event.event_type).toBe("test_event");
    expect(event.target).toBe("test_target");
    expect(event.metadata).toEqual({ key: "value" });
    expect(event.user_id).toBeTruthy();
    expect(event.timestamp).toBeTruthy();
    expect(event.session_id).toBeTruthy();
    expect(event.page).toBeTruthy();
  });

  it("stores multiple events", () => {
    clearEvents();
    trackEvent("event_1");
    trackEvent("event_2");
    trackEvent("event_3");

    const events = getAllEvents();
    expect(events.length).toBe(3);
  });

  it("clears events", () => {
    trackEvent("to_be_cleared");
    expect(getAllEvents().length).toBeGreaterThan(0);

    clearEvents();
    expect(getAllEvents().length).toBe(0);
  });
});
