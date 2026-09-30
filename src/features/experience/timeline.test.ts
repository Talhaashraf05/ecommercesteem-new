import { describe, expect, it } from "vitest";
import { cameraAt, heroOpacity, LEGACY_END, orbitOpacity, particleFade, sectionProgress, toLegacy, waveOpacity } from "./timeline";

describe("experience timeline", () => {
  it("section progress is 0 at top, 1 at end, clamped", () => {
    expect(sectionProgress(0, 6000, 1000)).toBe(0);
    expect(sectionProgress(-2500, 6000, 1000)).toBeCloseTo(0.5);
    expect(sectionProgress(-9000, 6000, 1000)).toBe(1);
    expect(sectionProgress(400, 6000, 1000)).toBe(0);
  });
  it("maps to legacy units", () => {
    expect(toLegacy(0)).toBe(0);
    expect(toLegacy(1)).toBe(LEGACY_END);
  });
  it("hero is fully visible on load and gone by the orbit", () => {
    expect(heroOpacity(0)).toBe(1);
    expect(heroOpacity(0.15)).toBe(0);
  });
  it("orbit and wave windows do not overlap", () => {
    for (let p = 0; p <= LEGACY_END; p += 0.005) {
      expect(Math.min(orbitOpacity(p), waveOpacity(p))).toBe(0);
    }
    expect(orbitOpacity(0.26)).toBe(1);
    expect(waveOpacity(0.55)).toBe(1);
  });
  it("particles fade out only at release", () => {
    expect(particleFade(0.5)).toBe(1);
    expect(particleFade(LEGACY_END)).toBe(0);
  });
  it("camera is finite for any progress (deep-link safe)", () => {
    for (const p of [0, 0.1, 0.33, 0.5, LEGACY_END, 2, -1]) {
      const c = cameraAt(p);
      for (const v of Object.values(c)) expect(Number.isFinite(v)).toBe(true);
    }
  });
});
