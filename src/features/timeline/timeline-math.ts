/** Milestone nearest to scroll progress `p` (0..1) across `n` items. */
export const focusIndex = (p: number, n: number) => Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));

/** Horizontal track shift (px) that brings the milestone at progress `p` to the start. */
export const trackOffset = (p: number, n: number, cardW: number, gap: number) => -p * (n - 1) * (cardW + gap);
