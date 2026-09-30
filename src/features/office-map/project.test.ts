import { describe, expect, it } from "vitest";
import { MAP_H, MAP_W, VB_H, VB_Y, markerPercent, project } from "./project";

describe("project", () => {
  it("maps (0,0) to the centre", () => {
    expect(project(0, 0, 360, 180)).toEqual({ x: 180, y: 90 });
  });
  it("maps the north-west corner to the origin", () => {
    expect(project(-180, 90, 360, 180)).toEqual({ x: 0, y: 0 });
  });
  it("maps the south-east corner to the far corner", () => {
    expect(project(180, -90, 360, 180)).toEqual({ x: 360, y: 180 });
  });
  it("scales with the box size", () => {
    expect(project(90, 45, 100, 50)).toEqual({ x: 75, y: 12.5 });
  });
});

describe("markerPercent", () => {
  const expected = (lon: number, lat: number) => {
    const { x, y } = project(lon, lat, MAP_W, MAP_H);
    return { left: (x / MAP_W) * 100, top: ((y - VB_Y) / VB_H) * 100 };
  };

  it.each([
    ["Dover", -75.52, 39.16],
    ["Tiranë", 19.82, 41.33],
    ["Lahore", 74.36, 31.52],
  ])("places %s relative to the cropped viewBox", (_name, lon, lat) => {
    const got = markerPercent(lon, lat);
    const want = expected(lon, lat);
    expect(got.left).toBeCloseTo(want.left, 6);
    expect(got.top).toBeCloseTo(want.top, 6);
  });

  it("puts Dover at about 29.02% / 32.03%", () => {
    const { left, top } = markerPercent(-75.52, 39.16);
    expect(left).toBeCloseTo(29.022, 2);
    expect(top).toBeCloseTo(32.029, 2);
  });
});
