"use client";

// Case-study hero: the client name (the page's h1) and the headline metric on one side, the
// case-study image on the other, shown whole in a frame (it carries its own headline and
// figures, so it is never cropped or covered by text). Behind them a soft red glow drifts
// down by up to 8% of the hero's height as the page scrolls past, via the shared ticker
// (a subtle parallax); the transform is written straight to the DOM, nothing re-renders.
// Reduced motion: no subscription, the glow stays put.
import { useEffect, useRef } from "react";
import Image from "next/image";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { Eyebrow } from "@/components/ui/eyebrow";

export interface ParallaxHeroProps {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  metric: { value: string; label: string };
}

const MAX_SHIFT = 8; // % of the photo layer's height

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

export const ParallaxHero = ({ image, alt, eyebrow, title, metric }: ParallaxHeroProps) => {
  const heroRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const layer = layerRef.current;
    if (!hero || !layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let last = -1;
    let unsubscribe: (() => void) | null = null;
    const tick = () => {
      const rect = hero.getBoundingClientRect();
      const shift = clamp01(-rect.top / Math.max(1, rect.height)) * MAX_SHIFT;
      if (Math.abs(shift - last) < 0.01) return;
      last = shift;
      layer.style.transform = `translate3d(0, ${shift.toFixed(2)}%, 0)`;
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !unsubscribe) {
        unsubscribe = subscribeToTicker(tick, () => 0);
      } else if (!entry.isIntersecting && unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    });
    io.observe(hero);
    return () => {
      io.disconnect();
      unsubscribe?.();
      layer.style.transform = "";
    };
  }, []);

  return (
    <header ref={heroRef} className="relative isolate overflow-hidden px-gutter pb-16 pt-32 md:pb-24 md:pt-40">
      <div ref={layerRef} className="absolute -inset-y-[8%] inset-x-0 -z-10 will-change-transform motion-reduce:will-change-auto">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_72%_45%,color-mix(in_srgb,var(--brand)_26%,transparent),transparent_70%)]"
        />
      </div>

      <div className="mx-auto grid w-full max-w-page items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-10">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-6 font-display text-display font-semibold leading-title tracking-title text-fg">{title}</h1>
          </div>
          <p className="flex flex-col gap-2 border-l-2 border-brand pl-6">
            <span className="font-display text-display-sm font-semibold leading-none tracking-title text-brand">
              {metric.value}
            </span>
            <span className="text-lead text-fg">{metric.label}</span>
          </p>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-card">
          <Image src={image} alt={alt} fill priority sizes="(min-width: 1024px) 58vw, 92vw" className="object-cover" />
        </div>
      </div>
    </header>
  );
};
