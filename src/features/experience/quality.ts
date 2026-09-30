export type Tier = "high" | "low" | "off";

export const TIER_CONFIG = {
  high: { widthSegments: 200, heightSegments: 600, bloom: true, maxDpr: 2 },
  low: { widthSegments: 110, heightSegments: 360, bloom: false, maxDpr: 1.5 },
} as const;

export const pickTier = (i: { reducedMotion: boolean; webgl: boolean; width: number; cores: number; saveData: boolean }): Tier => {
  if (i.reducedMotion || !i.webgl) return "off";
  if (i.width < 768 || i.cores <= 4 || i.saveData) return "low";
  return "high";
};

/** Browser probe; returns false if a WebGL context can't be created. */
export const hasWebGL = (): boolean => {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
};
