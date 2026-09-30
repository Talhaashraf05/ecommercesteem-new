"use client";

import { useEffect } from "react";
import { useSpring, type SpringValue } from "@react-spring/web";
import { subscribeToTicker } from "@/lib/animation/ticker";

/** A 0→1 value that repeats every `periodMs`, driven by the shared ticker. */
export const useTickerLoopValue = (periodMs: number): SpringValue<number> => {
  const [{ v }, api] = useSpring(() => ({ v: 0 }));
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return subscribeToTicker(
      (time) => api.start({ v: (time % periodMs) / periodMs, immediate: true }),
      () => 32, // ~30fps is plenty for a shimmer
    );
  }, [api, periodMs]);
  return v;
};
