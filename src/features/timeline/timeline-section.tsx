"use client";

// Company timeline. One DOM (a chronological <ol>) with two CSS-driven layouts so SSR
// markup is identical everywhere:
// - lg+ with motion: a pinned section (100lvh + 50lvh per extra milestone). Scroll
//   progress slides the card track horizontally, fills the rail, lights the focused
//   card and dims the year and title of the rest (body copy stays at full contrast).
// - otherwise: a vertical list with a left line and year markers; the line fills as the
//   list scrolls through the viewport (static under reduced motion).
// All per-frame writes go through refs from the shared ticker (no React state), and the
// ticker is only subscribed while the section is on screen.
import { useEffect, useRef } from "react";
import type { TimelineItem } from "@/content/schemas";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { sectionProgress } from "@/features/experience/timeline";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { focusIndex, focusOpacity, followFactor, trackOffset } from "./timeline-math";

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
// Opacity floors for unfocused cards, measured against bg-surface: the year (large text,
// darker gradient end #DC3326) stays >= 3:1 at 0.85, the title (fg) >= 4.5:1 at 0.5.
// Body copy (text-muted) is never dimmed, so it keeps its full 6.8:1.
const YEAR_DIM = 0.85;
const TITLE_DIM = 0.5;
const FOCUS_BORDER = "border-brand/60";
const REST_BORDER = "border-line";
// Vertical mode: the line is full once the list's end reaches this share of the viewport.
const FILL_ANCHOR = 0.65;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const TimelineSection = ({ items, heading, eyebrow }: TimelineSectionProps) => {
  const n = items.length;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const railFillRef = useRef<HTMLSpanElement>(null);
  const lineFillRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const yearRefs = useRef<(HTMLElement | null)[]>([]);
  const titleRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || n === 0) return;
    const pinnedMq = window.matchMedia(PINNED_QUERY);
    const reducedMq = window.matchMedia(REDUCED_QUERY);

    let cardW = 0; // measured card width (px)
    let gap = 0; // measured gap between cards (px)
    let maxTravel = Infinity; // how far the track can slide before the last card meets the right edge (px)
    let current: number | null = null; // low-passed progress
    let written: number | null = null; // progress last written to the DOM
    let lastTime: number | null = null; // ticker timestamp of the previous frame
    let focused = -1;
    let unsubscribe: (() => void) | null = null;
    let visible = false;

    const measure = () => {
      const lis = track.children;
      if (lis.length < 2) return;
      const a = lis[0] as HTMLElement;
      const b = lis[1] as HTMLElement;
      cardW = a.offsetWidth;
      gap = b.offsetLeft - a.offsetLeft - cardW;
      maxTravel = Math.max(0, track.scrollWidth - track.clientWidth);
    };

    const setFocus = (idx: number) => {
      if (idx === focused) return;
      focused = idx;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        card.classList.toggle(FOCUS_BORDER, i === idx);
        card.classList.toggle(REST_BORDER, i !== idx);
      });
    };

    const setDim = (els: (HTMLElement | null)[], value: (i: number) => string) =>
      els.forEach((el, i) => {
        if (el) el.style.opacity = value(i);
      });

    // Low-pass toward `target`, frame-rate independent. Returns null once settled, so
    // callers skip DOM writes while scroll is idle. `time` is absent on the synchronous
    // first frame, which snaps.
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
      track.style.transform = "";
      if (railFillRef.current) railFillRef.current.style.transform = "";
      if (lineFillRef.current) lineFillRef.current.style.transform = "";
      setDim(yearRefs.current, () => "");
      setDim(titleRefs.current, () => "");
      cardRefs.current.forEach((card) => {
        if (!card) return;
        card.classList.remove(FOCUS_BORDER);
        card.classList.add(REST_BORDER);
      });
    };

    const pinnedFrame = (time?: number) => {
      const rect = section.getBoundingClientRect();
      // First frame snaps (deep link / restored scroll), then follows smoothly.
      const p = follow(sectionProgress(rect.top, rect.height, window.innerHeight), time);
      if (p === null) return;
      track.style.transform = `translate3d(${trackOffset(p, n, cardW, gap, maxTravel).toFixed(2)}px,0,0)`;
      if (railFillRef.current) railFillRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      const f = p * (n - 1);
      setDim(yearRefs.current, (i) => focusOpacity(i, f, YEAR_DIM).toFixed(3));
      setDim(titleRefs.current, (i) => focusOpacity(i, f, TITLE_DIM).toFixed(3));
      setFocus(focusIndex(p, n));
    };

    const verticalFrame = (time?: number) => {
      const rect = track.getBoundingClientRect();
      const anchor = window.innerHeight * FILL_ANCHOR;
      const p = follow(clamp01((anchor - rect.top) / Math.max(1, rect.height)), time);
      if (p === null) return;
      if (lineFillRef.current) lineFillRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
    };

    const stop = () => {
      unsubscribe?.();
      unsubscribe = null;
    };

    // Subscribe while on screen. The first frame runs synchronously and snaps
    // (current = null), so re-entry never paints a stale pose.
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
      written = null; // card pitch changed: rewrite the pose even if progress is settled
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

          <div className="relative mt-14 lg:motion-safe:mt-16">
            {/* Pinned rail: sits through the year dots; the red fill tracks scroll progress. */}
            <span aria-hidden="true" className="hidden lg:motion-safe:absolute lg:motion-safe:inset-x-0 lg:motion-safe:top-[0.3125rem] lg:motion-safe:block lg:motion-safe:h-0.5 lg:motion-safe:rounded-full lg:motion-safe:bg-line-strong">
              <span
                ref={railFillRef}
                className="absolute inset-0 origin-left rounded-full [transform:scaleX(0)] bg-linear-to-r from-brand to-brand-glow shadow-[0_0_0.75rem_var(--brand-glow)] will-change-transform"
              />
            </span>
            {/* Vertical line: left of the markers; fills on scroll (full under reduced motion). */}
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-1.5 top-2 w-0.5 -translate-x-1/2 rounded-full bg-line-strong lg:motion-safe:hidden"
            >
              <span
                ref={lineFillRef}
                className="absolute inset-0 origin-top rounded-full shadow-[0_0_0.75rem_var(--brand-glow)] bg-linear-to-b from-brand to-brand-glow motion-safe:[transform:scaleY(0)] motion-safe:will-change-transform"
              />
            </span>

            <ol
              ref={trackRef}
              className="relative flex flex-col gap-10 pl-10 lg:motion-reduce:max-w-3xl lg:motion-safe:flex-row lg:motion-safe:gap-8 lg:motion-safe:pl-[calc(50%-13rem)] lg:motion-safe:will-change-transform"
            >
              {items.map((item, i) => (
                <li key={`${item.year}-${item.title}`} className="relative lg:motion-safe:flex lg:motion-safe:w-[26rem] lg:motion-safe:shrink-0 lg:motion-safe:flex-col">
                  <span
                    aria-hidden="true"
                    className="absolute -left-10 top-8 flex size-3 items-center justify-center rounded-full bg-brand shadow-[0_0_0.75rem_0.125rem_var(--brand-glow)] lg:motion-safe:relative lg:motion-safe:left-0 lg:motion-safe:top-0 lg:motion-safe:mb-8 lg:motion-safe:block"
                  />
                  <article
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="rounded-3xl border border-line bg-surface p-8 transition-colors duration-300 lg:motion-safe:flex-1"
                  >
                    <p
                      ref={(el) => {
                        yearRefs.current[i] = el;
                      }}
                      className="font-display text-stat font-semibold leading-none tracking-title text-gradient-brand"
                    >
                      {item.year}
                    </p>
                    <h3
                      ref={(el) => {
                        titleRefs.current[i] = el;
                      }}
                      className="mt-6 font-display text-h3 font-semibold text-fg"
                    >
                      {item.title}
                    </h3>
                    <p className="mt-3 text-muted">{item.body}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </div>
    </section>
  );
};
