import { create } from "zustand";
import { BEATS } from "./timeline";

/** Legacy-unit progress, written each frame by ExperienceSection's driver. */
export const experienceProgress = { current: 0 };

type WaveState = "before" | "visible" | "after";
const waveState = (p: number): WaveState =>
  p < BEATS.wave.inStart ? "before" : p <= BEATS.wave.outEnd ? "visible" : "after";

export const useExperiencePhase = create<{ wave: WaveState; sync: (p: number) => void }>((set, get) => ({
  wave: "before",
  sync: (p) => {
    const wave = waveState(p);
    if (get().wave !== wave) set({ wave });
  },
}));
