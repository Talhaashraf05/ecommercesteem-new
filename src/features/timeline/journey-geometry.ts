import { MAP_H, MAP_W, project } from "@/features/office-map/project";

export interface Pt {
  x: number;
  y: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Project each milestone's lon/lat into the shared equirectangular map box. */
export const projectWaypoints = (coords: readonly { lon: number; lat: number }[]): Pt[] =>
  coords.map(({ lon, lat }) => project(lon, lat, MAP_W, MAP_H));

/**
 * SVG path through the waypoints, each segment a quadratic arc bowed toward the top of the
 * map — the curved flight-route look. A segment's control point depends only on that
 * segment's endpoints, so any prefix `routePath(pts.slice(0, k + 1))` is exactly the start
 * of the full path: that's what lets the client measure each waypoint's distance along it.
 */
export const routePath = (pts: readonly Pt[], bow = 0.16): string => {
  if (pts.length === 0) return "";
  let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    if (ny > 0) {
      nx = -nx; // bow consistently upward (toward smaller y)
      ny = -ny;
    }
    const cx = mx + nx * len * bow;
    const cy = my + ny * len * bow;
    d += ` Q${cx.toFixed(2)} ${cy.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }
  return d;
};

/**
 * Overall scroll progress `p` (0..1) split into the current segment and the fraction
 * travelled along it, so every milestone gets an equal share of the scroll distance and
 * the marker sits exactly on a waypoint at each segment boundary.
 */
export const segmentProgress = (p: number, n: number): { index: number; frac: number } => {
  if (n < 2) return { index: 0, frac: 0 };
  const s = clamp01(p) * (n - 1);
  const index = Math.min(n - 2, Math.floor(s));
  return { index, frac: s - index };
};
