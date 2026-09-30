"use client";

import { useEffect, useRef } from "react";
import { subscribeToTicker } from "@/lib/animation/ticker";

const PERIOD = 2400; // ms per pulse loop
const STAGGER = 800; // ms phase offset between markers
const SCALE_FROM = 1;
const SCALE_TO = 2.4;
const OPACITY_FROM = 0.6;
const GLOW = "0 0 0.75rem 0.125rem var(--brand-glow)";

export interface PulseMarker {
  label: string;
  /** Position as a percentage of the map box. */
  left: number;
  top: number;
}

const ringStyle = (t: number) => ({
  transform: `scale(${(SCALE_FROM + (SCALE_TO - SCALE_FROM) * t).toFixed(3)})`,
  opacity: (OPACITY_FROM * (1 - t)).toFixed(3),
});

/**
 * Brand dots with a ring pulse (scale 1→2.4, opacity 0.6→0, 2.4 s loop) driven
 * by the shared ticker. Runs only while on screen; static under reduced motion.
 */
export const OfficePulse = ({ markers }: { markers: PulseMarker[] }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rings = Array.from(root.querySelectorAll<HTMLElement>("[data-ring]"));

    let unsubscribe: (() => void) | null = null;
    const stop = () => {
      unsubscribe?.();
      unsubscribe = null;
    };
    const start = () => {
      if (unsubscribe) return;
      unsubscribe = subscribeToTicker(
        (time) => {
          rings.forEach((ring, i) => {
            const t = ((time + i * STAGGER) % PERIOD) / PERIOD;
            Object.assign(ring.style, ringStyle(t));
          });
        },
        () => 32, // ~30fps is plenty for a soft pulse
      );
    };

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) start();
      else stop();
    });
    io.observe(root);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0">
      {markers.map(({ label, left, top }) => (
        <span
          key={label}
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <span
            data-ring=""
            className="absolute inset-0 rounded-full border border-brand will-change-transform"
            style={ringStyle(0.25)}
          />
          <span className="absolute inset-0 rounded-full bg-brand" style={{ boxShadow: GLOW }} />
        </span>
      ))}
    </div>
  );
};
