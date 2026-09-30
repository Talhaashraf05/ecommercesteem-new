"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { hasWebGL, pickTier, type Tier } from "@/features/experience/quality";

import type { HeroShape } from "./shapes";

const HeroSceneCanvas = dynamic(() => import("./hero-scene-canvas").then((m) => m.HeroSceneCanvas), { ssr: false });

export interface HeroSceneProps {
  shape: HeroShape;
  /** Pointer tilt on desktop; default true. */
  interactive?: boolean;
  className?: string;
}

/**
 * Decorative particle backdrop for inner-page heroes. The brand gradient
 * renders on the server and stays as the fallback; the WebGL canvas (three.js,
 * loaded on demand) mounts after idle only when the device earns a tier.
 */
export const HeroScene = ({ shape, interactive = true, className = "" }: HeroSceneProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const active = useRef(true);
  const [tier, setTier] = useState<Tier>("off");

  // Pick the quality tier after first paint so the canvas never blocks LCP.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() =>
      setTier(
        pickTier({
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          webgl: hasWebGL(),
          width: window.innerWidth,
          cores: navigator.hardwareConcurrency ?? 4,
          saveData: Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData),
        }),
      ),
    );
    return () => cancel(id);
  }, []);

  // The render loop idles while the hero is scrolled out of view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      active.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className={`pointer-events-none relative h-full w-full ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,var(--brand)_0%,transparent_60%)] opacity-30" />
      {tier !== "off" && (
        <HeroSceneCanvas shape={shape} interactive={interactive} tier={tier} active={active} onContextLost={() => setTier("off")} />
      )}
    </div>
  );
};
