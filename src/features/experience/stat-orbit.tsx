"use client";

import { useEffect, useRef } from "react";

import { useLoop } from "@/hooks/animation/use-render-loop";

import { experienceProgress } from "./progress";
import { BEATS, orbitOpacity } from "./timeline";

/**
 * Three stat cards orbiting the DNA helix during the orbit beat — New Era's
 * dna-cards + stat-card merged. Positions are a parametric function of
 * progress, written straight to the DOM each frame from the shared ticker.
 * Under reduced motion the loop is skipped and CSS lays the cards out as a
 * static grid. The visual cards are aria-hidden (they are only visible during
 * their beat); ExperienceSection renders an sr-only copy for screen readers.
 */

export interface StatOrbitCard {
  id: string;
  title: string;
  stat: string;
  description: string;
}

const ANGLE_OFFSETS = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
const Y_OFFSETS = [-150, 0, 150];
const ORBIT_SPAN = BEATS.orbit.outEnd - BEATS.orbit.inStart;

export const StatOrbit = ({ cards }: { cards: StatOrbitCard[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useLoop(
    () => {
      if (reduceRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      const p = experienceProgress.current;
      const opacity = orbitOpacity(p);
      container.style.opacity = String(opacity);
      container.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
      if (opacity <= 0) return;

      const orbit = (p - BEATS.orbit.inStart) / ORBIT_SPAN;
      const globalYOffset = 600 - orbit * 1200;
      const baseAngle = orbit * Math.PI * 2;
      const cx = container.clientWidth / 2;
      const cy = container.clientHeight / 2;
      const rx = Math.min(container.clientWidth * 0.35, 400);
      const ry = 80;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const angle = baseAngle + ANGLE_OFFSETS[i % 3];
        const x = cx + Math.cos(angle) * rx;
        const y = cy + Math.sin(angle) * ry + globalYOffset + Y_OFFSETS[i % 3];
        const scale = 0.8 + 0.2 * Math.sin(angle);
        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale}) rotateY(${angle - Math.PI / 2}rad)`;
        el.style.opacity = String(0.4 + 0.6 * Math.sin(angle));
        el.style.zIndex = String(Math.round(scale * 100));
      });
    },
    { framerate: 0 },
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] opacity-0 motion-reduce:static motion-reduce:grid motion-reduce:gap-4 motion-reduce:p-gutter md:motion-reduce:grid-cols-3 motion-reduce:opacity-100!"
      style={{ perspective: "1200px" }}
    >
      {cards.map((card, i) => (
        <div
          key={card.id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 opacity-0 will-change-transform motion-reduce:relative motion-reduce:transform-none! motion-reduce:opacity-100!"
        >
          <div
            className="w-[var(--width-card)] rounded-3xl border border-line-strong bg-surface-card p-10 shadow-card backdrop-blur-lg max-sm:p-6 motion-reduce:w-auto"
          >
            {/* A stat callout, not a heading — avoids a heading-level skip. */}
            <p className="mb-8 font-display text-kicker font-semibold uppercase tracking-wider text-fg/90">{card.title}</p>
            <p className="mb-6 inline-block font-display text-stat font-semibold leading-none text-gradient-brand">{card.stat}</p>
            <p className="font-display text-lead leading-normal text-muted">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
