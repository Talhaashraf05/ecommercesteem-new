"use client";

// Company journey as a map. One DOM with two CSS layouts so SSR markup is identical:
// - lg+ with motion: a pinned section (100lvh + 50lvh per extra milestone). Scroll progress
//   draws the red route across a dotted world map one segment per milestone, flies a glowing
//   marker from each waypoint to the next, lights the reached pins and cross-fades the caption
//   of the focused milestone.
// - otherwise: the map renders with the full route and every pin lit, above a vertical list of
//   milestones whose left line fills as the list scrolls (all static under reduced motion).
// All per-frame writes go through refs from the shared ticker (no React state), and the ticker
// is only subscribed while the section is on screen.
import { useEffect, useRef } from "react";
import type { TimelineItem } from "@/content/schemas";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MAP_H, MAP_W, VB_H, VB_Y, project } from "@/features/office-map/project";
import { WORLD_DOTS } from "@/features/office-map/world-dots";
import { sectionProgress } from "@/features/experience/timeline";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { focusIndex, followFactor } from "./timeline-math";
import { projectWaypoints, routePath, segmentProgress } from "./journey-geometry";

export interface TimelineSectionProps {
  items: TimelineItem[];
  heading: string;
  eyebrow: string;
}

const HEADING_ID = "timeline-title";
const PINNED_QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const FOLLOW = 0.14; // low-pass of the scroll read per 60fps frame (scaled by real frame time)
const SETTLED = 1e-4; // progress delta below which the pose counts as settled (no writes)
const PIN_DIM = 0.28; // opacity floor for a milestone the journey has not reached yet
const CAP_HOLD = 0.35; // half-width of the band where a caption stays fully opaque
const PULSE_PERIOD = 2200; // ms per marker-ring pulse loop
const RING_FROM = 1;
const RING_TO = 2.6;
const RING_OPACITY = 0.55;
// Vertical mode: the list's left line is full once its end reaches this share of the viewport.
const FILL_ANCHOR = 0.65;

// One stroked path: a zero-length round-capped segment per land dot renders as a circle of
// diameter strokeWidth, far cheaper than one <circle> each. Deterministic, so SSR-stable.
const DOTS_PATH = WORLD_DOTS.map(([lon, lat]) => {
  const { x, y } = project(lon, lat, MAP_W, MAP_H);
  return `M${x.toFixed(2)} ${y.toFixed(2)}h0`;
}).join("");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const TimelineSection = ({ items, heading, eyebrow }: TimelineSectionProps) => {
  const n = items.length;
  const pts = projectWaypoints(items);
  const routeD = routePath(pts);

  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const revealRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const lineFillRef = useRef<HTMLSpanElement>(null);
  const olRef = useRef<HTMLOListElement>(null);
  const pinRefs = useRef<(SVGCircleElement | null)[]>([]);
  const pinRingRefs = useRef<(SVGCircleElement | null)[]>([]);
  const capRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || n < 2) return;
    const pinnedMq = window.matchMedia(PINNED_QUERY);
    const reducedMq = window.matchMedia(REDUCED_QUERY);

    let total = 0; // path length (px, user units)
    let pinU: number[] = []; // each waypoint's fractional distance (0..1) along the route
    let current: number | null = null; // low-passed progress
    let written: number | null = null; // progress last written to the DOM
    let lastTime: number | null = null; // ticker timestamp of the previous frame
    let focused = -1;
    let unsubscribe: (() => void) | null = null;
    let visible = false;

    // Measure the route once per layout: total length, and each waypoint's share of it. A
    // prefix of the path is a valid route through the first k points (see journey-geometry),
    // so a throwaway hidden path measures the cumulative distance to each waypoint.
    const measure = () => {
      const route = routeRef.current;
      const svg = svgRef.current;
      if (!route || !svg) return;
      total = route.getTotalLength();
      const meas = document.createElementNS("http://www.w3.org/2000/svg", "path");
      meas.setAttribute("fill", "none");
      meas.setAttribute("stroke", "none");
      svg.appendChild(meas);
      pinU = pts.map((_, k) => {
        if (k === 0) return 0;
        meas.setAttribute("d", routePath(pts.slice(0, k + 1)));
        return total > 0 ? meas.getTotalLength() / total : 0;
      });
      svg.removeChild(meas);
    };

    const setFocus = (idx: number) => {
      if (idx === focused) return;
      focused = idx;
      pinRingRefs.current.forEach((ring, i) => {
        if (ring) ring.style.opacity = i === idx ? "1" : "0";
      });
    };

    // Low-pass toward `target`, frame-rate independent. Returns null once settled, so callers
    // skip pose writes while scroll is idle. `time` is absent on the synchronous first frame.
    const follow = (target: number, time?: number) => {
      const dt = time !== undefined && lastTime !== null ? time - lastTime : 0;
      if (time !== undefined) lastTime = time;
      current = current === null || time === undefined ? target : current + (target - current) * followFactor(FOLLOW, dt);
      if (Math.abs(target - current) < SETTLED) current = target;
      if (written !== null && Math.abs(current - written) < SETTLED) return null;
      written = current;
      return current;
    };

    const reset = () => {
      focused = -1;
      if (revealRef.current) revealRef.current.style.strokeDashoffset = "0";
      if (markerRef.current) markerRef.current.style.opacity = "";
      pinRefs.current.forEach((pin) => {
        if (pin) pin.style.opacity = "";
      });
      pinRingRefs.current.forEach((ring) => {
        if (ring) ring.style.opacity = "";
      });
      capRefs.current.forEach((cap) => {
        if (!cap) return;
        cap.style.opacity = "";
        cap.style.transform = "";
        cap.style.pointerEvents = "";
      });
      if (lineFillRef.current) lineFillRef.current.style.transform = "";
    };

    const pinnedFrame = (time?: number) => {
      // The marker ring pulses on its own clock, so update it every frame — even when the pose
      // below is settled and skipped.
      if (time !== undefined && ringRef.current) {
        const t = (time % PULSE_PERIOD) / PULSE_PERIOD;
        ringRef.current.setAttribute("transform", `scale(${(RING_FROM + (RING_TO - RING_FROM) * t).toFixed(3)})`);
        ringRef.current.style.opacity = (RING_OPACITY * (1 - t)).toFixed(3);
      }

      const rect = section.getBoundingClientRect();
      const p = follow(sectionProgress(rect.top, rect.height, window.innerHeight), time);
      if (p === null) return;

      const { index, frac } = segmentProgress(p, n);
      const u = pinU.length === n ? pinU[index] + (pinU[index + 1] - pinU[index]) * frac : p;
      if (revealRef.current) revealRef.current.style.strokeDashoffset = (1 - u).toFixed(4);

      const route = routeRef.current;
      if (route && markerRef.current) {
        const pt = route.getPointAtLength(u * total);
        markerRef.current.setAttribute("transform", `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
        markerRef.current.style.opacity = "1";
      }

      const f = p * (n - 1);
      pinRefs.current.forEach((pin, i) => {
        if (pin) pin.style.opacity = i <= f ? "1" : Math.max(PIN_DIM, 1 - (i - f) * 0.9).toFixed(3);
      });
      capRefs.current.forEach((cap, i) => {
        if (!cap) return;
        // Near-exclusive cross-fade: one caption holds full opacity within ±0.35 of its
        // milestone, fading out by the midpoint so two captions never overlap legibly.
        const d = Math.abs(i - f);
        const o = d <= CAP_HOLD ? 1 : clamp01((0.5 - d) / (0.5 - CAP_HOLD));
        cap.style.opacity = o.toFixed(3);
        cap.style.transform = `translateY(${((i - f) * 0.5).toFixed(2)}rem)`;
        cap.style.pointerEvents = o > 0.5 ? "auto" : "none";
      });
      setFocus(focusIndex(p, n));
    };

    const verticalFrame = (time?: number) => {
      const list = olRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const anchor = window.innerHeight * FILL_ANCHOR;
      const p = follow(clamp01((anchor - rect.top) / Math.max(1, rect.height)), time);
      if (p === null) return;
      if (lineFillRef.current) lineFillRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
    };

    const stop = () => {
      unsubscribe?.();
      unsubscribe = null;
    };

    // Subscribe while on screen. The first frame runs synchronously and snaps (current = null),
    // so re-entry never paints a stale pose.
    const start = () => {
      stop();
      if (reducedMq.matches || !visible) return;
      const pinned = pinnedMq.matches;
      if (pinned) measure();
      const frame = pinned ? pinnedFrame : verticalFrame;
      current = null;
      written = null;
      lastTime = null;
      frame();
      unsubscribe = subscribeToTicker(frame, () => 0);
    };

    // Layout mode changed (resize across lg, or the motion preference flipped).
    const onModeChange = () => {
      stop();
      reset();
      start();
    };

    const io = new IntersectionObserver((entries) => {
      const next = entries.some((e) => e.isIntersecting);
      if (next === visible) return;
      visible = next;
      if (visible) start();
      else stop();
    });
    io.observe(section);

    const onResize = () => {
      if (!pinnedMq.matches) return;
      measure();
      written = null; // geometry changed: rewrite the pose even if progress is settled
    };
    pinnedMq.addEventListener("change", onModeChange);
    reducedMq.addEventListener("change", onModeChange);
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      stop();
      pinnedMq.removeEventListener("change", onModeChange);
      reducedMq.removeEventListener("change", onModeChange);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  if (n === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby={HEADING_ID}
      className="relative px-gutter py-24 md:py-32 lg:motion-safe:h-(--timeline-h) lg:motion-safe:p-0"
      style={{ "--timeline-h": `calc(100lvh + ${(n - 1) * 50}lvh)` } as React.CSSProperties}
    >
      <div className="lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:flex lg:motion-safe:h-lvh lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:overflow-hidden lg:motion-safe:px-gutter">
        <Container>
          <Eyebrow>{eyebrow}</Eyebrow>
          <AnimatedHeading
            as="h2"
            id={HEADING_ID}
            className="mt-6 font-display text-display-sm font-semibold leading-title tracking-title text-fg"
          >
            {heading}
          </AnimatedHeading>

          <div className="relative mt-12 lg:motion-safe:mt-10">
            {/* Dotted world map with the journey route, waypoints and the travelling marker.
                Decorative: every milestone is also read as text in the list below. */}
            <div aria-hidden="true" className="mx-auto w-full lg:motion-safe:max-w-[74rem]">
              <svg ref={svgRef} viewBox={`0 ${VB_Y} ${MAP_W} ${VB_H}`} className="block h-auto w-full" focusable="false">
                <path d={DOTS_PATH} strokeWidth={1.6} strokeLinecap="round" className="stroke-line-strong" fill="none" />
                {/* Base route track under the red reveal. */}
                <path ref={routeRef} d={routeD} fill="none" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" className="stroke-line-strong" />
                {/* Red route: drawn fully by default; the pinned frame reveals it on scroll. */}
                <path
                  ref={revealRef}
                  d={routeD}
                  pathLength={1}
                  fill="none"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-brand [stroke-dasharray:1] [stroke-dashoffset:0] lg:motion-safe:[stroke-dashoffset:1] lg:motion-safe:will-change-[stroke-dashoffset]"
                  style={{ filter: "drop-shadow(0 0 0.35rem var(--brand-glow))" }}
                />
                {pts.map((pt, i) => (
                  <g key={`${items[i].year}-${items[i].title}`}>
                    <circle
                      ref={(el) => {
                        pinRingRefs.current[i] = el;
                      }}
                      cx={pt.x}
                      cy={pt.y}
                      r={3.4}
                      strokeWidth={0.7}
                      fill="none"
                      className="stroke-brand opacity-0"
                    />
                    <circle
                      ref={(el) => {
                        pinRefs.current[i] = el;
                      }}
                      cx={pt.x}
                      cy={pt.y}
                      r={1.7}
                      className="fill-brand"
                    />
                  </g>
                ))}
                {/* Travelling marker: hidden until the pinned frame positions it. */}
                <g ref={markerRef} className="opacity-0" style={{ filter: "drop-shadow(0 0 0.5rem var(--brand-glow))" }}>
                  <circle ref={ringRef} r={2.4} strokeWidth={0.8} fill="none" className="stroke-brand" />
                  <circle r={2.4} className="fill-brand" />
                </g>
              </svg>
            </div>

            {/* Milestones. Flowing list on mobile / reduced motion; on the pinned map they stack
                into one caption card over the map, cross-fading to the focused milestone. */}
            <div className="relative mt-10 lg:motion-safe:absolute lg:motion-safe:bottom-4 lg:motion-safe:left-4 lg:motion-safe:z-10 lg:motion-safe:mt-0 lg:motion-safe:w-[24rem] lg:motion-safe:rounded-3xl lg:motion-safe:border lg:motion-safe:border-line lg:motion-safe:bg-surface-card lg:motion-safe:p-7 lg:motion-safe:backdrop-blur-xl">
              {/* Left line beside the list; fills as the list scrolls (static under reduced motion). */}
              <span
                aria-hidden="true"
                className="absolute bottom-2 left-1.5 top-2 w-0.5 -translate-x-1/2 rounded-full bg-line-strong lg:motion-safe:hidden"
              >
                <span
                  ref={lineFillRef}
                  className="absolute inset-0 origin-top rounded-full bg-linear-to-b from-brand to-brand-glow shadow-[0_0_0.75rem_var(--brand-glow)] motion-safe:[transform:scaleY(0)] motion-safe:will-change-transform"
                />
              </span>

              <ol ref={olRef} className="relative flex flex-col gap-10 pl-10 lg:motion-safe:grid lg:motion-safe:gap-0 lg:motion-safe:pl-0">
                {items.map((item, i) => (
                  <li
                    key={`${item.year}-${item.title}`}
                    ref={(el) => {
                      capRefs.current[i] = el;
                    }}
                    className="relative rounded-3xl border border-line bg-surface p-8 lg:motion-safe:[grid-area:1/1] lg:motion-safe:border-0 lg:motion-safe:bg-transparent lg:motion-safe:p-0"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-10 top-10 size-3 rounded-full bg-brand shadow-[0_0_0.75rem_0.125rem_var(--brand-glow)] lg:motion-safe:hidden"
                    />
                    <p className="text-kicker font-semibold uppercase tracking-[0.2em] text-brand">{item.place}</p>
                    <p className="mt-3 font-display text-stat font-semibold leading-none tracking-title text-gradient-brand">{item.year}</p>
                    <h3 className="mt-4 font-display text-h3 font-semibold text-fg">{item.title}</h3>
                    <p className="mt-3 text-muted">{item.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
};
