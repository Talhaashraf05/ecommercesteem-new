/**
 * Equirectangular projection: longitude/latitude (degrees) to x/y inside a
 * `w`×`h` box whose origin is the north-west corner (-180, 90).
 */
export const project = (lon: number, lat: number, w: number, h: number): { x: number; y: number } => ({
  x: ((lon + 180) / 360) * w,
  y: ((90 - lat) / 180) * h,
});

/** Full equirectangular map box. */
export const MAP_W = 360;
export const MAP_H = 180;
/** Rendered viewBox crop: dots span y 10–142, so trim the empty polar bands. */
export const VB_Y = 6;
export const VB_H = 140;

/** A lon/lat position as a percentage of the cropped map box (for absolutely positioned markers). */
export const markerPercent = (lon: number, lat: number): { left: number; top: number } => {
  const { x, y } = project(lon, lat, MAP_W, MAP_H);
  return { left: (x / MAP_W) * 100, top: ((y - VB_Y) / VB_H) * 100 };
};
