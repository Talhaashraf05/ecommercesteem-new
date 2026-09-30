import { describe, expect, it } from "vitest";
import { autoSpinRate, frameSteps, nearestSlot, stepTarget, wheelLayout, wrapDeg, AUTO_SPIN, SLOT_DEG } from "./wheel-math";

describe("wheelLayout", () => {
  it("sizes the ring for a 1440×900 section", () => {
    const l = wheelLayout(1440, 900);
    expect(l.ch).toBeCloseTo(378); // 0.42 × 900
    expect(l.cw).toBeCloseTo(309.96); // × 0.82
    expect(l.r).toBeCloseTo(1239.84); // 4 card widths beats 0.7 × 1440
    expect(l.cy).toBeCloseTo(0.48 * 900 + 1239.84);
    expect(l.quoteSize).toBeCloseTo(18.9);
    expect(l.quoteLines).toBe(7); // (378 − 156) / (18.9 × 1.625)
  });

  it("holds the card-height floor on a 390×844 phone", () => {
    const l = wheelLayout(390, 844);
    expect(l.ch).toBe(312); // 0.5 × 390 = 195 is under the 312px floor
    expect(l.cw).toBeCloseTo(255.84);
    expect(l.r).toBeCloseTo(1023.36);
    expect(l.cy).toBeCloseTo(0.56 * 844 + 1023.36); // portrait offset
    expect(l.quoteSize).toBeCloseTo(15.6);
    expect(l.quoteLines).toBe(6);
  });

  // Bottom of the top-right "What / clients / say" h2: 4.5rem header + clamp(10px, 2.5vh,
  // 40px) inset + 3 lines at clamp(40px, min(12vw, 15.5vh), 120px) × 0.84 leading, at a
  // 16px root (the adaptive root is never larger, so this is the worst case).
  const headingBottom = (w: number, h: number) =>
    72 + Math.min(40, Math.max(10, 0.025 * h)) + 3 * 0.84 * Math.min(120, Math.max(40, Math.min(0.12 * w, 0.155 * h)));

  it.each([
    [390, 844],
    [375, 667],
    [768, 1024],
  ])("keeps the top card clear of the heading in %i×%i portrait", (w, h) => {
    const l = wheelLayout(w, h);
    expect(l.cy - l.r - l.ch / 2).toBeGreaterThan(headingBottom(w, h));
  });

  it("caps the card height at 416px on tall, wide screens", () => {
    expect(wheelLayout(3840, 2160).ch).toBe(416);
  });
});

describe("nearestSlot", () => {
  it("is slot 0 at rest", () => {
    expect(nearestSlot(0)).toBe(0);
  });

  it("wraps positive and negative rotations", () => {
    // rot 350 ≡ −10°: slot 1 (at +7.1°) is nearer the top than slot 0 (at −10°).
    expect(nearestSlot(350)).toBe(1);
    // rot 10: slot 20 sits at 352.9° ≡ −7.1°, nearer than slot 0 at +10°.
    expect(nearestSlot(10)).toBe(20);
    // rot −190 ≡ 170°: slot 11 lands at 188.6 − 190 = −1.4°.
    expect(nearestSlot(-190)).toBe(11);
    expect(nearestSlot(-190 - 360 * 5)).toBe(11);
  });

  it("maps slots onto testimonials evenly (21 slots, 7 items)", () => {
    expect(nearestSlot(-SLOT_DEG * 9) % 7).toBe(2);
  });
});

describe("helpers", () => {
  it("wrapDeg keeps angles in (−180, 180]", () => {
    expect(wrapDeg(190)).toBeCloseTo(-170);
    expect(wrapDeg(-190)).toBeCloseTo(170);
    expect(wrapDeg(180)).toBe(180);
    expect(wrapDeg(-180)).toBe(180);
    expect(wrapDeg(720)).toBe(0);
  });

  it("stepTarget snaps to the slot grid and moves one slot", () => {
    expect(stepTarget(0, 1)).toBeCloseTo(-SLOT_DEG);
    expect(stepTarget(SLOT_DEG * 2.3, -1)).toBeCloseTo(SLOT_DEG * 3);
    expect(nearestSlot(stepTarget(0, 1))).toBe(1);
  });

  it("frameSteps normalises to 60 fps and clamps stalls", () => {
    expect(frameSteps(1000 / 60)).toBeCloseTo(1);
    expect(frameSteps(1000 / 120)).toBeCloseTo(0.5);
    expect(frameSteps(5000)).toBeCloseTo(6);
    expect(frameSteps(-3)).toBe(0);
  });
});

describe("autoSpinRate", () => {
  const idle = { paused: false, hovered: false, focused: false };
  it("drifts only when nothing holds it", () => {
    expect(autoSpinRate(idle)).toBe(AUTO_SPIN);
  });
  it("stops while hovered, focused or paused", () => {
    expect(autoSpinRate({ ...idle, hovered: true })).toBe(0);
    expect(autoSpinRate({ ...idle, focused: true })).toBe(0);
    expect(autoSpinRate({ ...idle, paused: true })).toBe(0);
  });
});
