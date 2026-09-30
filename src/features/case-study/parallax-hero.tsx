"use client";

// Case-study hero: a full-bleed photo (the LCP image) under a scrim, with the client
// name (the page's h1) and the headline metric over its base. While the hero is in
// view, the shared ticker drifts the photo down by up to 8% of its height as the page
// scrolls past, so it trails the copy (a subtle parallax). The transform is written
// straight to the DOM; nothing re-renders. Reduced motion: no subscription, static photo.
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
    <header ref={heroRef} className="relative isolate flex h-[80lvh] min-h-[34rem] items-end overflow-hidden">
      <div ref={layerRef} className="absolute inset-0 -z-20 will-change-transform motion-reduce:will-change-auto">
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
      </div>
      {/* Scrim: page background rising from the base (copy contrast), plus a light
          veil at the top so the fixed header stays legible over the photo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/65 via-35% to-bg/25"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-bg/70 to-transparent" />

      <div className="w-full px-gutter pb-14 md:pb-20">
        <div className="mx-auto flex w-full max-w-page flex-col gap-6 lg:flex-row lg:gap-10 lg:items-end lg:justify-between">
          <div className="max-w-title">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-6 font-display text-display font-semibold leading-title tracking-title text-fg">{title}</h1>
          </div>
          <p className="flex max-w-md flex-col gap-2 lg:items-end lg:text-right">
            <span className="font-display text-display font-semibold leading-none tracking-title text-brand">
              {metric.value}
            </span>
            <span className="text-lead text-fg">{metric.label}</span>
          </p>
        </div>
      </div>
    </header>
  );
};
