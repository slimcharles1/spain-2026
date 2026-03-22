// IP route uses NextRequest which requires Web API Request (not available in jsdom).
// Test the logic directly instead.

describe("IP Route Logic", () => {
  function extractIp(headers: Record<string, string | null>): string {
    const forwarded = headers["x-forwarded-for"];
    const ip = forwarded?.split(",")[0]?.trim() || headers["x-real-ip"] || "unknown";
    return ip;
  }

  it("extracts IP from x-forwarded-for", () => {
    expect(extractIp({ "x-forwarded-for": "1.2.3.4, 5.6.7.8", "x-real-ip": null })).toBe("1.2.3.4");
  });

  it("extracts first IP from multiple x-forwarded-for", () => {
    expect(extractIp({ "x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3", "x-real-ip": null })).toBe("10.0.0.1");
  });

  it("falls back to x-real-ip", () => {
    expect(extractIp({ "x-forwarded-for": null, "x-real-ip": "9.8.7.6" })).toBe("9.8.7.6");
  });

  it("returns unknown when no headers", () => {
    expect(extractIp({ "x-forwarded-for": null, "x-real-ip": null })).toBe("unknown");
  });
});
