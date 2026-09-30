/** Shapes the inner-page hero can hold, each a frozen frame of the home morph. */
export type HeroShape = "sphere" | "helix" | "wave";

/** Legacy (New Era) progress at which each shape is fully formed. */
export const SHAPE_PROGRESS: Record<HeroShape, number> = { sphere: 0, helix: 0.29, wave: 0.55 };

/**
 * Pointer tilt target in radians: zero at the centre of the `w`×`h` area,
 * ±`max` at its edges. Pointer y tilts about x (inverted), pointer x about y.
 */
export const tiltTarget = (px: number, py: number, w: number, h: number, max = 0.25) =>
  ({ x: ((py / h) - 0.5) * -2 * max, y: ((px / w) - 0.5) * 2 * max });
