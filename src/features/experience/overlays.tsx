"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GlassButton } from "@/components/ui/glass-button";
import { useLoop } from "@/hooks/animation/use-render-loop";

import { experienceProgress, useExperiencePhase } from "./progress";
import { heroOpacity, waveOpacity } from "./timeline";

/**
 * Text overlays for the experience's sticky stage. Opacity/translate are a pure
 * function of progress (written each frame from the shared ticker), so a reload
 * mid-section shows the right beat. Roots are pointer-events-none (buttons opt
 * back in) and `visibility: hidden` when faded out so hidden CTAs can't be
 * clicked or tabbed to. Reduced motion: CSS forces the end state.
 */
const useProgressStyle = (fn: (p: number) => number) => {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(
    () => {
      const el = ref.current;
      if (!el) return;
      const o = fn(experienceProgress.current);
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(1 - o) * -24}px, 0)`;
      el.style.visibility = o <= 0.001 ? "hidden" : "visible";
    },
    { framerate: 0 },
  );
  return ref;
};

const REDUCED_STATIC = "motion-reduce:relative motion-reduce:min-h-lvh motion-reduce:opacity-100! motion-reduce:visible! motion-reduce:transform-none!";

export const HeroOverlay = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) => {
  const ref = useProgressStyle(heroOpacity);
  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-gutter text-center ${REDUCED_STATIC}`}
    >
      <Eyebrow className="mb-8">{eyebrow}</Eyebrow>
      {/* Plain h1 (no letter animation) — it is the LCP element and must paint from SSR HTML. */}
      <h1 className="mb-6 max-w-title font-display text-display font-semibold leading-title tracking-title">{title}</h1>
      <p className="mb-10 max-w-lead text-lead text-muted">{subtitle}</p>
      <div className="flex gap-4 max-md:w-full max-md:max-w-75 max-md:flex-col max-md:items-center">
        <GlassButton href="/contact" withArrow>
          Book a free audit
        </GlassButton>
        <GlassButton href="/work" variant="secondary">
          See our work
        </GlassButton>
      </div>
    </div>
  );
};

export const WaveOverlay = ({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) => {
  const ref = useProgressStyle(waveOpacity);
  const wave = useExperiencePhase((s) => s.wave);
  // Reduced motion stacks the wave copy statically, so its heading can't wait for
  // the wave beat. Flip after mount (false → true) so SSR markup matches and the
  // cascade, seeing reduced motion, jumps straight to revealed.
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  // Latch: once the wave beat is reached the cascade must run to completion,
  // even if the user scrolls back above it mid-cascade (startWhen isn't latched
  // inside the cascade hook).
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (wave !== "before") setSeen(true);
  }, [wave]);
  const startWhen = reduce || seen;
  return (
    <div
      ref={ref}
      style={{ opacity: 0, visibility: "hidden" }}
      className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-15 px-gutter max-lg:flex-col max-lg:items-start max-lg:justify-center max-lg:gap-8 ${REDUCED_STATIC}`}
    >
      <div className="max-w-title-sm flex-1 max-lg:flex-none">
        <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
        <AnimatedHeading
          as="h2"
          startWhen={startWhen}
          className="font-display text-display-sm font-semibold leading-title tracking-title"
        >
          {title}
        </AnimatedHeading>
      </div>
      <div className="max-w-lead-sm flex-1 max-lg:flex-none">
        <p className="mb-8 text-lead text-muted">{body}</p>
        <GlassButton href="/services" withArrow>
          Explore services
        </GlassButton>
      </div>
    </div>
  );
};
