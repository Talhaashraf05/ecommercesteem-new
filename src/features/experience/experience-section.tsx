"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { Client } from "@/content/schemas";
import { subscribeToTicker } from "@/lib/animation/ticker";

import { HeroOverlay, WaveOverlay } from "./overlays";
import { experienceProgress, useExperiencePhase } from "./progress";
import { hasWebGL, pickTier, type Tier } from "./quality";
import { LogoOrbit } from "./logo-orbit";
import { SECTION_VH, sectionProgress, toLegacy } from "./timeline";

const ParticleCanvas = dynamic(() => import("./particle-canvas").then((m) => m.ParticleCanvas), { ssr: false });

export interface ExperienceCopy {
  hero: { eyebrow: string; title: string; subtitle: string };
  logos: Client[];
  wave: { eyebrow: string; title: string; body: string };
}

/**
 * The pinned home experience: a tall section whose sticky stage holds the
 * particle canvas and the hero / stat-orbit / wave overlays. Its own scroll
 * progress (mapped to New Era's legacy units) drives everything.
 */
export const ExperienceSection = ({ copy }: { copy: ExperienceCopy }) => {
  const sectionRef = useRef<HTMLElement>(null);
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

  // Progress driver: section-relative, runs regardless of tier so overlays always
  // work. A layout effect so it subscribes to the ticker before the overlays'
  // (passive) loops — they then read this frame's progress, not last frame's.
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      active.current = e.isIntersecting;
    });
    io.observe(el);
    const unsub = subscribeToTicker(() => {
      const r = el.getBoundingClientRect();
      const p = toLegacy(sectionProgress(r.top, r.height, window.innerHeight));
      experienceProgress.current = p;
      useExperiencePhase.getState().sync(p);
    }, () => 0);
    return () => {
      io.disconnect();
      unsub();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      // The negative bottom margin lets the next section (the client logo strip) slide up over
      // the pinned stage once its content has faded, instead of waiting for an empty screen.
      className="relative -mb-[30lvh] motion-reduce:mb-0 motion-reduce:h-auto!"
      style={{ height: `${SECTION_VH}vh` }}
    >
      <div className="sticky top-0 h-lvh overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,var(--brand)_0%,transparent_55%)] motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible">
        {/* Fallback gradient sits under the canvas; the canvas covers it once live. */}
        <div aria-hidden="true" className="absolute inset-0 bg-bg/80" />
        {tier !== "off" && <ParticleCanvas tier={tier} active={active} onContextLost={() => setTier("off")} />}
        <HeroOverlay {...copy.hero} />
        {/* Screen-reader copy of the beats that are only visible mid-scroll (the
            visual client logos and wave text are aria-hidden). */}
        <div className="sr-only">
          <ul>
            {copy.logos.map((logo) => (
              <li key={logo.name}>{logo.name}</li>
            ))}
          </ul>
          <p>{copy.wave.eyebrow}</p>
          <h2>{copy.wave.title}</h2>
          <p>{copy.wave.body}</p>
          <Link href="/services">Explore services</Link>
        </div>
        <LogoOrbit logos={copy.logos} />
        <WaveOverlay {...copy.wave} />
      </div>
    </section>
  );
};
