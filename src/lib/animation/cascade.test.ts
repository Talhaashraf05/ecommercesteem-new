import { describe, expect, it } from "vitest";
import { clamp01, easeOutQuart, rangeProgress, staggerProgress, windowOpacity } from "./cascade";

describe("cascade math", () => {
  it("clamps", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
  });
  it("eases out quart at endpoints", () => {
    expect(easeOutQuart(0)).toBe(0);
    expect(easeOutQuart(1)).toBe(1);
    expect(easeOutQuart(0.5)).toBeCloseTo(0.9375);
  });
  it("maps range progress", () => {
    expect(rangeProgress(0.1, 0.2, 0.4)).toBe(0);
    expect(rangeProgress(0.3, 0.2, 0.4)).toBeCloseTo(0.5);
    expect(rangeProgress(0.9, 0.2, 0.4)).toBe(1);
  });
  it("window opacity rises, holds, falls", () => {
    expect(windowOpacity(0.1, 0.2, 0.3, 0.6, 0.7)).toBe(0);
    expect(windowOpacity(0.25, 0.2, 0.3, 0.6, 0.7)).toBeCloseTo(0.5);
    expect(windowOpacity(0.45, 0.2, 0.3, 0.6, 0.7)).toBe(1);
    expect(windowOpacity(0.65, 0.2, 0.3, 0.6, 0.7)).toBeCloseTo(0.5);
    expect(windowOpacity(0.8, 0.2, 0.3, 0.6, 0.7)).toBe(0);
  });
  it("staggers items so the last starts later", () => {
    expect(staggerProgress(0.3, 0, 4)).toBeGreaterThan(staggerProgress(0.3, 3, 4));
    expect(staggerProgress(1, 3, 4)).toBe(1);
    expect(staggerProgress(0, 0, 1)).toBe(0);
  });
});
