"use client";

/**
 * Hero scroll cue: a round down-arrow button pinned to the bottom of a hero.
 * The chevron bobs down and back on a loop to draw the eye (driven by the
 * shared ticker, per ADR-0002 — never a self-running spring or CSS keyframe),
 * and a click smooth-scrolls to the section right after the hero.
 *
 * The bob runs only while the cue is on screen and is skipped under
 * `prefers-reduced-motion`, so the arrow simply sits still.
 */

import { useEffect, useRef } from "react";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { ChevronDownIcon } from "./icons";

const PERIOD = 1400; // ms per bob
const TRAVEL = 8; // px the chevron dips down
const HEADER = 80; // fixed header (h-18 = 72px) plus a little breathing room

// 0 → TRAVEL → 0 over one period: a down-only bob that reads as "go down".
const dip = (t: number) => ((Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2) * TRAVEL;

interface LenisLike {
  scrollTo: (target: HTMLElement | number, opts?: { offset?: number }) => void;
}

export const ScrollCue = ({ label = "Scroll to content" }: { label?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const icon = iconRef.current;
    if (!el || !icon) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let unsubscribe: (() => void) | null = null;
    const stop = () => {
      unsubscribe?.();
      unsubscribe = null;
    };
    const start = () => {
      if (unsubscribe) return;
      unsubscribe = subscribeToTicker(
        (time) => {
          icon.style.transform = `translateY(${dip((time % PERIOD) / PERIOD).toFixed(2)}px)`;
        },
        () => 24, // ~40fps is plenty for a soft bob
      );
    };

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) start();
      else stop();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  const onClick = () => {
    const header = ref.current?.closest("header");
    const target = header?.nextElementSibling as HTMLElement | null;
    const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
    if (target) {
      if (lenis) lenis.scrollTo(target, { offset: -HEADER });
      else target.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const top = window.scrollY + window.innerHeight * 0.9;
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface-glass p-3 text-fg shadow-card backdrop-blur-md transition-colors duration-200 hover:border-brand/50 hover:text-brand-glow motion-reduce:transition-none"
    >
      <span ref={iconRef} className="flex will-change-transform">
        <ChevronDownIcon className="size-5" />
      </span>
    </button>
  );
};
