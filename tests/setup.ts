import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount React trees between tests so screen.getByTestId doesn't cross fixtures.
afterEach(() => {
  cleanup();
});

/**
 * jsdom v29 under vitest does not ship a working `window.localStorage`.
 * Install a spec-compliant in-memory implementation so tests that exercise
 * client persistence (persona storage, etc.) can run.
 */
if (typeof window !== "undefined") {
  const proto = Object.getPrototypeOf(window.localStorage ?? {});
  const hasSetItem = proto && typeof proto.setItem === "function";
  if (!hasSetItem) {
    class MemoryStorage implements Storage {
      private store = new Map<string, string>();
      get length() {
        return this.store.size;
      }
      clear(): void {
        this.store.clear();
      }
      getItem(key: string): string | null {
        return this.store.has(key) ? (this.store.get(key) as string) : null;
      }
      key(index: number): string | null {
        return Array.from(this.store.keys())[index] ?? null;
      }
      removeItem(key: string): void {
        this.store.delete(key);
      }
      setItem(key: string, value: string): void {
        this.store.set(key, String(value));
      }
    }
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: new MemoryStorage(),
    });
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: new MemoryStorage(),
    });
  }
}
