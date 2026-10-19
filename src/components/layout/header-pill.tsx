"use client";

// The header's glass capsule, drawn as a separate layer behind the logo / links / button.
// Scroll progress (0 → 1 over RANGE px) widens it from the link capsule's box to the whole
// header row, so it swallows the logo and the button. One react-spring value follows the
// scroll offset, fed by the shared ticker (ADR-0015: no self-running springs). On screens
// without the link capsule (below lg) the pill is the full row and only fades in.
import { animated, useSpringValue } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";

import { subscribeToTicker } from "@/lib/animation/ticker";

const RANGE = 140; // px of scroll for the full morph
const FOLLOW = 0.14; // per-frame low-pass toward the scroll target (soft glide)
const SPILL = 20; // px the expanded pill extends past the logo / button

interface Box {
  w0: number;
  h0: number;
  w1: number;
  h1: number;
  fade: boolean;
}

export const HeaderPill = () => {
  const p = useSpringValue(0);
  const rowRef = useRef<HTMLDivElement>(null);
  // Mutated in place by measure(); read only inside the spring interpolations.
  const [box] = useState<Box>({ w0: 0, h0: 0, w1: 0, h1: 0, fade: true });

  useEffect(() => {
    const row = rowRef.current?.parentElement;
    if (!row) return;
    const nav = row.querySelector<HTMLElement>("nav[aria-label=Primary]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const measure = () => {
      const cs = getComputedStyle(row);
      const inner = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const w1 = Math.min(row.clientWidth, inner + SPILL * 2);
      const h1 = Math.round(row.clientHeight * 0.85);
      const w0 = nav?.offsetWidth ?? 0;
      const h0 = nav?.offsetHeight ?? 0;
      Object.assign(box, w0 > 0 ? { w0, h0, w1, h1, fade: false } : { w0: w1, h0: h1, w1, h1, fade: true });
      // Re-run the interpolations with the new box. Setting an unchanged value is a no-op,
      // so nudge it by a hair (otherwise the pill stays 0 wide until the first scroll).
      const v = p.get();
      p.set(v + (v < 1 ? 1e-6 : -1e-6));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);

    let current = Math.min(1, window.scrollY / RANGE);
    p.set(current);
    const unsub = subscribeToTicker(
      () => {
        const target = Math.min(1, window.scrollY / RANGE);
        const next = reduced.matches ? Math.round(target) : current + (target - current) * FOLLOW;
        if (Math.abs(next - current) < 1e-4 && next === current) return;
        current = Math.abs(target - next) < 1e-3 ? target : next;
        p.set(current);
      },
      () => 0,
    );
    return () => {
      ro.disconnect();
      unsub();
    };
  }, [p, box]);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return (
    <animated.div
      ref={rowRef}
      aria-hidden="true"
      style={{
        width: p.to((t) => lerp(box.w0, box.w1, t)),
        height: p.to((t) => lerp(box.h0, box.h1, t)),
        opacity: p.to((t) => (box.fade ? t : 1)),
        boxShadow: p.to((t) => `0 8px 32px rgb(0 0 0 / ${lerp(0.35, 0.5, t)})`),
      }}
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-strong bg-bg/80 backdrop-blur-xl"
    />
  );
};
