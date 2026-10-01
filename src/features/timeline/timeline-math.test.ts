import { describe, expect, it } from "vitest";
import { focusIndex, focusOpacity, followFactor, trackOffset } from "./timeline-math";

describe("focusIndex", () => {
  it("maps progress to the nearest milestone", () => {
    expect(focusIndex(0, 6)).toBe(0);
    expect(focusIndex(1, 6)).toBe(5);
    expect(focusIndex(0.5, 6)).toBe(3); // 2.5 rounds up
  });

  it("clamps out-of-range progress", () => {
    expect(focusIndex(-1, 6)).toBe(0);
    expect(focusIndex(2, 6)).toBe(5);
  });
});

describe("trackOffset", () => {
  it("slides the track one card pitch per milestone", () => {
    expect(trackOffset(1, 6, 400, 32)).toBe(-2160);
    expect(trackOffset(0.5, 6, 400, 32)).toBe(-1080);
  });
});

describe("followFactor", () => {
  it("equals the base factor at 60fps", () => {
    expect(followFactor(0.14, 16.67)).toBeCloseTo(0.14, 6);
  });

  it("compounds over longer frames so 30fps covers the same ground as two 60fps frames", () => {
    const two60 = 1 - (1 - 0.14) ** 2;
    expect(followFactor(0.14, 33.34)).toBeCloseTo(two60, 6);
  });

  it("stays within 0..1 for odd frame gaps", () => {
    expect(followFactor(0.14, 0)).toBe(0);
    expect(followFactor(0.14, -5)).toBe(0);
    expect(followFactor(0.14, 10_000)).toBeLessThanOrEqual(1);
  });
});

describe("focusOpacity", () => {
  it("is 1 on the focused card and falls to the floor one card away", () => {
    expect(focusOpacity(2, 2, 0.5)).toBe(1);
    expect(focusOpacity(1, 2, 0.5)).toBe(0.5);
    expect(focusOpacity(4, 2, 0.5)).toBe(0.5);
    expect(focusOpacity(1.5, 2, 0.5)).toBe(0.75);
  });
});
