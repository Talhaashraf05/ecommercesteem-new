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

/**
 * Browser probe; false if a WebGL context can't be created, or only with a
 * major performance caveat (software rendering) — those devices get "off".
 * The probe context is released straight away so it doesn't count against the
 * browser's live-context limit.
 */
export const hasWebGL = (): boolean => {
  try {
    const c = document.createElement("canvas");
    const opts: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const gl = c.getContext("webgl2", opts) ?? c.getContext("webgl", opts);
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
};
