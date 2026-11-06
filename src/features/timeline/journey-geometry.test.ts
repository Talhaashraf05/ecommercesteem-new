import { describe, expect, it } from "vitest";
import { MAP_H, MAP_W, project } from "@/features/office-map/project";
import { projectWaypoints, routePath, segmentProgress } from "./journey-geometry";

describe("projectWaypoints", () => {
  it("projects each waypoint with the shared map projection", () => {
    const coords = [
      { lon: 0, lat: 0 },
      { lon: 74.36, lat: 31.52 },
    ];
    expect(projectWaypoints(coords)).toEqual(coords.map((c) => project(c.lon, c.lat, MAP_W, MAP_H)));
  });
});

describe("routePath", () => {
  it("is empty for no points", () => {
    expect(routePath([])).toBe("");
  });

  it("opens with a move to the first point and draws one arc per segment", () => {
    const d = routePath([
      { x: 0, y: 50 },
      { x: 100, y: 50 },
      { x: 200, y: 50 },
    ]);
    expect(d.startsWith("M0.00 50.00")).toBe(true);
    expect((d.match(/Q/g) ?? []).length).toBe(2);
  });

  it("bows each segment upward (control point above the endpoints)", () => {
    const d = routePath([
      { x: 0, y: 50 },
      { x: 100, y: 50 },
    ]);
    const control = d.match(/Q([\d.-]+) ([\d.-]+)/);
    expect(control).not.toBeNull();
    expect(Number(control![2])).toBeLessThan(50); // smaller y = higher on the map
  });
});

describe("segmentProgress", () => {
  it("degenerates safely below two waypoints", () => {
    expect(segmentProgress(0.5, 1)).toEqual({ index: 0, frac: 0 });
  });

  it("maps progress to an equal share per milestone", () => {
    expect(segmentProgress(0, 6)).toEqual({ index: 0, frac: 0 });
    expect(segmentProgress(0.1, 6)).toEqual({ index: 0, frac: 0.5 });
    expect(segmentProgress(0.5, 6)).toEqual({ index: 2, frac: 0.5 });
  });

  it("clamps the end to the last segment at full travel", () => {
    expect(segmentProgress(1, 6)).toEqual({ index: 4, frac: 1 });
    expect(segmentProgress(2, 6)).toEqual({ index: 4, frac: 1 });
  });
});
