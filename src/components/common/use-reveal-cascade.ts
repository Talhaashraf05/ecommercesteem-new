"use client";

// Shared per-item reveal cascade used by <AnimatedHeading>, the About heading, and the
// bento card reveals. Drives one react-spring value `p` 0→1 from the shared ticker
// (react-spring's own self-running springs don't progress in this project — see
// [[decisions-log]] ADR-0015). `localProg(p, i)` gives item `i`'s eased 0→1 progress
// within the staggered timeline. Reduced motion jumps straight to revealed.
//
// Trigger: by default it starts when the observed `rootRef` element scrolls into view.
// Pass `{ startWhen }` (a boolean) to instead start when that flag becomes true — used by
// the hero, which is on-screen behind the preloader rather than scroll-triggered.
//
// `p` is a standalone SpringValue (useSpringValue), not `useSpring(() => ({ p: 0 }))`:
// react-spring v10's useSprings keeps the hook's initial update and re-starts the
// controller with it in a layout effect on EVERY render, so a parent re-render after
// the reveal would spring `p` back to 0 (hidden). A SpringValue is created once and
// only ever moves when we set it, so re-renders keep the last driven progress.
import { useEffect, useMemo, useRef } from "react";
import { useSpringValue, type SpringValue } from "@react-spring/web";
import { staggerProgress } from "@/lib/animation/cascade";
import { subscribeToTicker } from "@/lib/animation/ticker";

const DURATION = 1400; // ms for the whole cascade

export interface RevealCascade<T extends HTMLElement = HTMLElement> {
  p: SpringValue<number>;
  rootRef: React.RefObject<T | null>;
  localProg: (v: number, i: number) => number;
}

export interface RevealCascadeOptions {
  /** When provided, the cascade starts once this flag is true (instead of on scroll-in). */
  startWhen?: boolean;
}

export function useRevealCascade<T extends HTMLElement = HTMLElement>(
  total: number,
  options?: RevealCascadeOptions,
): RevealCascade<T> {
  const rootRef = useRef<T>(null);
  const startedRef = useRef(false);
  const gated = options?.startWhen !== undefined;
  // Scroll-triggered items SSR fully visible (p = 1) so they never depend on JS to be
  // readable; on mount the effect hides only those that are still below the fold.
  // Flag-gated items (the experience wave heading) start hidden until their flag.
  const p = useSpringValue(gated ? 0 : 1);
  const startWhen = options?.startWhen;

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let unsubscribe = () => {};
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (reduce) {
        p.set(1);
        return;
      }
      let t0: number | null = null;
      let done = false;
      unsubscribe = subscribeToTicker(
        (time) => {
          if (done) return;
          if (t0 === null) t0 = time;
          const t = Math.min((time - t0) / DURATION, 1);
          p.set(t);
          if (t >= 1) {
            done = true;
            unsubscribe();
          }
        },
        () => 0,
      );
    };

    // Flag-gated: start once startWhen turns true.
    if (gated) {
      if (startWhen) start();
      return () => unsubscribe();
    }

    // Default: start when the element scrolls into view.
    const el = rootRef.current;
    if (!el) return;
    if (reduce) return; // stays visible
    if (startedRef.current) return; // already revealed; never re-hide on effect re-run
    // Already in view (or scrolled past) at mount: leave visible, no flash.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
      startedRef.current = true;
      return;
    }
    p.set(0);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      unsubscribe();
    };
  }, [p, gated, startWhen]);

  const localProg = useMemo(
    () => (v: number, i: number) => staggerProgress(v, i, total),
    [total],
  );

  return { p, rootRef, localProg };
}
