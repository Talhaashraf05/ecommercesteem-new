import { clamp01, rangeProgress, windowOpacity } from "@/lib/animation/cascade";

/** Section height in vh. Scroll distance = SECTION_VH - 100. */
export const SECTION_VH = 600;
/** Last legacy progress value we play (end of the wave beat). */
export const LEGACY_END = 0.64;

export const toLegacy = (q: number): number => clamp01(q) * LEGACY_END;

/** Section's own scroll progress from its bounding rect. */
export const sectionProgress = (rectTop: number, rectHeight: number, viewportH: number): number =>
  clamp01(-rectTop / Math.max(1, rectHeight - viewportH));

/** Beat windows in legacy units (New Era values). */
export const BEATS = {
  hero: { outStart: 0.02, outEnd: 0.06 },
  orbit: { inStart: 0.15, inEnd: 0.18, outStart: 0.35, outEnd: 0.38 },
  wave: { inStart: 0.46, inEnd: 0.5, outStart: 0.6, outEnd: 0.63 },
  release: { start: 0.6, end: LEGACY_END },
} as const;

export const heroOpacity = (p: number): number => 1 - rangeProgress(p, BEATS.hero.outStart, BEATS.hero.outEnd);
export const orbitOpacity = (p: number): number =>
  windowOpacity(p, BEATS.orbit.inStart, BEATS.orbit.inEnd, BEATS.orbit.outStart, BEATS.orbit.outEnd);
export const waveOpacity = (p: number): number =>
  windowOpacity(p, BEATS.wave.inStart, BEATS.wave.inEnd, BEATS.wave.outStart, BEATS.wave.outEnd);
export const particleFade = (p: number): number => 1 - rangeProgress(p, BEATS.release.start, BEATS.release.end);

const smooth = (t: number) => t * t * (3 - 2 * t);

/** New Era camera path, trimmed to the beats we keep (no dive, no galaxy). */
export const cameraAt = (raw: number) => {
  const p = Math.min(Math.max(raw, 0), LEGACY_END);
  const pan = smooth(Math.min(p / 0.5, 1));
  const fly = p < 0.5 ? 0 : Math.min((p - 0.5) / 0.35, 1);
  const y = -38 * pan;
  const z = 8 - 4 * pan - 55 * fly;
  const tilt = p > 0.3 && p < 0.7 ? Math.sin(((p - 0.3) / 0.4) * Math.PI) * 15 : 0;
  return { y, z, lookY: y + tilt, lookZ: z - 100, rotY: pan * Math.PI * 2, rotX: Math.sin(pan * Math.PI) * 0.15 };
};
