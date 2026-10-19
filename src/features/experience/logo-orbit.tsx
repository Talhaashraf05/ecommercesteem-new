"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { Client } from "@/content/schemas";
import { useLoop } from "@/hooks/animation/use-render-loop";

import { experienceProgress } from "./progress";
import { BEATS, orbitOpacity } from "./timeline";

/**
 * Client logos orbiting the DNA helix during the orbit beat. Positions are a
 * parametric function of progress, written straight to the DOM each frame from
 * the shared ticker. Under reduced motion the loop is skipped and CSS lays the
 * logos out as a static grid. The visual logos are aria-hidden (they are only
 * visible during their beat); ExperienceSection renders an sr-only list.
 */

const Y_OFFSETS = [-150, 0, 150];
const ORBIT_SPAN = BEATS.orbit.outEnd - BEATS.orbit.inStart;

export const LogoOrbit = ({ logos }: { logos: Client[] }) => {
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
      const globalYOffset = 420 - orbit * 1020; // starts closer to the viewport so the logos show up sooner; still ends at -600
      const baseAngle = orbit * Math.PI * 2;
      const cx = container.clientWidth / 2;
      const cy = container.clientHeight / 2;
      const rx = Math.min(container.clientWidth * 0.35, 400);
      const ry = 80;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const angle = baseAngle + (i * 2 * Math.PI) / logos.length;
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
      className="pointer-events-none absolute inset-0 z-[5] opacity-0 motion-reduce:static motion-reduce:grid motion-reduce:gap-4 motion-reduce:p-gutter md:motion-reduce:grid-cols-4 motion-reduce:opacity-100!"
      style={{ perspective: "1200px" }}
    >
      {logos.map((logo, i) => (
        <div
          key={logo.name}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 opacity-0 will-change-transform motion-reduce:relative motion-reduce:transform-none! motion-reduce:opacity-100!"
        >
          <div className="flex h-24 w-48 items-center justify-center rounded-3xl border border-line-strong bg-surface-card px-8 shadow-card backdrop-blur-lg max-sm:h-20 max-sm:w-36 max-sm:px-5 motion-reduce:w-auto">
            <Image
              src={logo.logo}
              alt=""
              width={logo.width}
              height={logo.height}
              className="max-h-12 w-auto max-w-full object-contain opacity-80 brightness-0 invert max-sm:max-h-9"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
