/**
 * Equirectangular projection: longitude/latitude (degrees) to x/y inside a
 * `w`×`h` box whose origin is the north-west corner (-180, 90).
 */
export const project = (lon: number, lat: number, w: number, h: number): { x: number; y: number } => ({
  x: ((lon + 180) / 360) * w,
  y: ((90 - lat) / 180) * h,
});
