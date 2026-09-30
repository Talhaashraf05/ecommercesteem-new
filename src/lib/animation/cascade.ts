export const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

export const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export const rangeProgress = (v: number, start: number, end: number): number =>
  end <= start ? (v >= end ? 1 : 0) : clamp01((v - start) / (end - start));

export const windowOpacity = (
  v: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
): number => Math.min(rangeProgress(v, inStart, inEnd), 1 - rangeProgress(v, outStart, outEnd));

/** Per-item eased progress within a staggered 0→1 timeline (Stride localProg). */
export const staggerProgress = (v: number, i: number, total: number, spread = 0.55): number => {
  const start = total > 1 ? (i / (total - 1)) * spread : 0;
  const span = 1 - spread;
  return easeOutQuart(span <= 0 ? 1 : clamp01((v - start) / span));
};
