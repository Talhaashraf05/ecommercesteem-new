import { describe, expect, it } from "vitest";
import { previewPosition } from "./preview-math";

// 352×264 preview (22rem, 4:3) in a 1440×900 viewport; offset 24, margin 16.
const W = 352;
const H = 264;

describe("previewPosition", () => {
  it("sits right of the cursor, vertically centred on it", () => {
    expect(previewPosition(400, 450, W, H, 1440, 900)).toEqual({ x: 424, y: 450 - H / 2 });
  });
  it("flips to the left of the cursor near the right edge", () => {
    expect(previewPosition(1300, 450, W, H, 1440, 900)).toEqual({ x: 1300 - 24 - W, y: 450 - H / 2 });
  });
  it("clamps near the top and bottom edges", () => {
    expect(previewPosition(400, 20, W, H, 1440, 900).y).toBe(16);
    expect(previewPosition(400, 890, W, H, 1440, 900).y).toBe(900 - 16 - H);
  });
  it("clamps to the margin when the viewport is too small to flip", () => {
    // Neither side of the cursor fits: the flip would go off-screen, so it pins to the left margin.
    expect(previewPosition(30, 450, W, H, 400, 900).x).toBe(16);
    expect(previewPosition(200, 450, W, H, 400, 900).x).toBe(16);
  });
  it("pins to the far margin when the viewport is smaller than the preview", () => {
    // The upper bound (viewport - margin - size) wins over the lower one, so the
    // preview stays a margin off the right and bottom edges.
    const p = previewPosition(100, 100, W, H, 300, 200);
    expect(p).toEqual({ x: 300 - 16 - W, y: 200 - 16 - H });
  });
});
