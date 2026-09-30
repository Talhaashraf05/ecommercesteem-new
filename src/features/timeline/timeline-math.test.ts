import { describe, expect, it } from "vitest";
import { focusIndex, trackOffset } from "./timeline-math";

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
