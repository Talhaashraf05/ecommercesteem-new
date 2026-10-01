/** Milestone nearest to scroll progress `p` (0..1) across `n` items. */
export const focusIndex = (p: number, n: number) => Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));

/** Horizontal track shift (px) that brings the milestone at progress `p` to the start. */
export const trackOffset = (p: number, n: number, cardW: number, gap: number) => -p * (n - 1) * (cardW + gap);

const FRAME_MS = 16.67;

/**
 * Low-pass factor for a frame `dt` ms long, given the per-60fps-frame factor `base`.
 * Frame-rate independent: two 60fps frames and one 30fps frame cover the same ground.
 */
export const followFactor = (base: number, dt: number) => (dt <= 0 ? 0 : 1 - Math.pow(1 - base, dt / FRAME_MS));

/**
 * Opacity of a card's dimmed parts: 1 when the card at index `i` is focused (`f` is the
 * fractional focus position), easing to `floor` one card away and beyond.
 */
export const focusOpacity = (i: number, f: number, floor: number) => floor + (1 - floor) * Math.max(0, 1 - Math.abs(i - f));
