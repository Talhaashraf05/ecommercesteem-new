import { describe, expect, it } from "vitest";
import { frameSteps, nearestSlot, stepTarget, wheelLayout, wrapDeg, SLOT_DEG } from "./wheel-math";

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
    expect(l.ch).toBe(312); // 0.5 × 390 = 195 is under the 19.5rem floor
    expect(l.cw).toBeCloseTo(255.84);
    expect(l.r).toBeCloseTo(1023.36);
    expect(l.cy).toBeCloseTo(0.48 * 844 + 1023.36);
    expect(l.quoteSize).toBeCloseTo(15.6);
    expect(l.quoteLines).toBe(6);
  });

  it("caps the card height at 26rem on tall, wide screens", () => {
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
