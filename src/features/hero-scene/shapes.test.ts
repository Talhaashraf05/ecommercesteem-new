import { describe, expect, it } from "vitest";
import { SHAPE_PROGRESS, tiltTarget } from "./shapes";
import { cameraAt } from "@/features/experience/timeline";
describe("hero shapes", () => {
  it("maps shapes to legacy progress inside their beats", () => {
    expect(SHAPE_PROGRESS.sphere).toBe(0);
    expect(SHAPE_PROGRESS.helix).toBeGreaterThanOrEqual(0.27);
    expect(SHAPE_PROGRESS.helix).toBeLessThanOrEqual(0.3);
    expect(SHAPE_PROGRESS.wave).toBeGreaterThanOrEqual(0.5);
    expect(SHAPE_PROGRESS.wave).toBeLessThanOrEqual(0.6);
  });
  it("camera is finite for every shape", () => {
    for (const p of Object.values(SHAPE_PROGRESS)) for (const v of Object.values(cameraAt(p))) expect(Number.isFinite(v)).toBe(true);
  });
  it("tilt is zero at centre and bounded", () => {
    expect(tiltTarget(500, 400, 1000, 800)).toEqual({ x: -0, y: 0 });
    const t = tiltTarget(1000, 0, 1000, 800);
    expect(t.y).toBeCloseTo(0.25); expect(t.x).toBeCloseTo(0.25);
  });
});
