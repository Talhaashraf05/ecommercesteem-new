import { describe, expect, it } from "vitest";
import { project } from "./project";

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
