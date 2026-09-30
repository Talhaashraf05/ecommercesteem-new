import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("rate limiter", () => {
  it("allows up to limit per window then blocks, then resets", () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(allow("ip", 0)).toBe(true);
    expect(allow("ip", 10)).toBe(true);
    expect(allow("ip", 20)).toBe(false);
    expect(allow("other", 20)).toBe(true);
    expect(allow("ip", 1500)).toBe(true);
  });
});
