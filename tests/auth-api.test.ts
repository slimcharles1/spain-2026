import { describe, it, expect } from "vitest";

// Test the SHA-256 hashing and password validation logic
describe("auth API logic", () => {
  async function sha256(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const EXPECTED_HASH = "8fc0293969dac57c25a58c82f2f4c43bf5cd8b37fcb70c4d7bfa80a8f7cb5b2c";

  it("correct password produces expected hash", async () => {
    const hash = await sha256("realmadrid");
    expect(hash).toBe(EXPECTED_HASH);
  });

  it("wrong password does not match", async () => {
    const hash = await sha256("wrongpassword");
    expect(hash).not.toBe(EXPECTED_HASH);
  });

  it("password matching is case-insensitive (after toLowerCase)", async () => {
    const hash = await sha256("RealMadrid".toLowerCase().trim());
    expect(hash).toBe(EXPECTED_HASH);
  });

  it("empty password does not match", async () => {
    const hash = await sha256("");
    expect(hash).not.toBe(EXPECTED_HASH);
  });
});
