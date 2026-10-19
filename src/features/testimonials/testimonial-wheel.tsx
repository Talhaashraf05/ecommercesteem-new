"use client";

// Testimonial wheel — cards on the rim of a large circle whose centre sits below the
// section, fanning across the top like a spread hand. Slow idle drift, drag to spin
// with inertia, arrow keys step one slot. One `--rot` custom property on the wheel is
// written per frame from the shared ticker (ADR-0015); nothing calls setState per frame,
// so the component never re-renders while it moves. The loop is unsubscribed while the
// section is off-screen or the tab is hidden.
//
// Phones: the stage is `touch-action: pan-y pinch-zoom`, and a drag only starts once horizontal
// movement dominates, so vertical page scroll is never trapped.
// Reduced motion: no drift, no inertia, keyboard steps land instantly; drag still works.
// WCAG 2.2.2: the drift stops while the pointer is over the stage or it has focus, and
// for good after the first drag or arrow key; a visible toggle pauses / resumes it.
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Testimonial } from "@/content/schemas";
import { subscribeToTicker } from "@/lib/animation/ticker";
import {
  CARD_ASPECT,
  CARD_MAX_H,
  CARD_MIN_H,
  QUOTE_MAX_PX,
  QUOTE_MIN_PX,
  RADIUS_MINK,
  RADIUS_VW,
  DRAG,
  INERTIA,
  SLOT_DEG,
  SLOTS,
  autoSpinRate,
  easeOutCubic,
  frameSteps,
  nearestSlot,
  pad2,
  stepTarget,
  wheelLayout,
} from "./wheel-math";

const DRAG_THRESHOLD = 6; // px of horizontal travel before a drag is recognised
const FLING_WINDOW = 80; // ms — a release later than this after the last move doesn't fling
const STEP_MS = 450; // arrow-key tween
const SETTLE_MS = 800; // glide to the nearest card after a drag
const DRAG_EASE = 0.78; // share of the gap to the pointer left per 60 fps frame (higher = silkier, laggier)

// Pre-mount defaults: the same maths as wheelLayout() in CSS, against the section's
// box (h-lvh, min 40rem), so the fan is in place before hydration and doesn't move.
// Card and quote bounds are px to match wheel-math (the site's rem is adaptive).
const SECTION_H = "max(100lvh, 40rem)";
const DEFAULT_VARS = {
  "--ch": `max(${CARD_MIN_H}px, min(calc(${SECTION_H} * 0.42), 50vw, ${CARD_MAX_H}px))`,
  "--cw": `calc(var(--ch) * ${CARD_ASPECT})`,
  "--r": `max(${RADIUS_VW * 100}vw, calc(var(--cw) * ${RADIUS_MINK}))`,
  "--cy": `calc(${SECTION_H} * var(--top) + var(--r))`, // --top: 0.48, portrait 0.56 (classes)
  "--q-size": `clamp(${QUOTE_MIN_PX}px, calc(var(--ch) * 0.05), ${QUOTE_MAX_PX}px)`,
  "--q-lines": "6",
  "--rot": "0deg",
} as CSSProperties;

const PauseIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="size-3">
    <path d="M4 2h3v12H4zM9 2h3v12H9z" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="size-3">
    <path d="M4 2l10 6-10 6z" />
  </svg>
);

const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
    <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
  </svg>
);

export interface TestimonialWheelProps {
  items: Testimonial[];
  /** Screen-reader content for the carousel region (the full testimonial list). */
  children: ReactNode;
}

export const TestimonialWheel = ({ items, children }: TestimonialWheelProps) => {
  const count = items.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  // `paused` drives the toggle's label; the frame loop reads the ref so toggling never
  // re-runs the effect. The first drag / arrow key pauses it too (stopForGood).
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const togglePaused = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  useEffect(() => {
    const stage = stageRef.current;
    const wheel = wheelRef.current;
    if (!stage || !wheel || count === 0) return;
    const cards = Array.from(wheel.children) as HTMLElement[];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let rot = 0;
    let vel = 0; // deg per 60 fps frame
    let topSlot = 0;
    let lastTime: number | null = null;
    let tween: { from: number; to: number; start: number | null; ms: number } | null = null;
    let dragTarget = 0; // where the pointer says the wheel should be; rot eases toward it
    let hovered = false;
    let focused = false;
    const stopForGood = () => {
      if (pausedRef.current) return;
      pausedRef.current = true;
      setPaused(true);
    };

    const apply = () => {
      wheel.style.setProperty("--rot", `${rot}deg`);
      const slot = nearestSlot(rot);
      if (slot === topSlot) return;
      cards[topSlot]?.removeAttribute("data-top");
      cards[slot]?.setAttribute("data-top", "");
      topSlot = slot;
      if (counterRef.current) counterRef.current.textContent = pad2((slot % count) + 1);
    };

    const layout = () => {
      const l = wheelLayout(stage.clientWidth, stage.clientHeight);
      stage.style.setProperty("--cw", `${l.cw}px`);
      stage.style.setProperty("--ch", `${l.ch}px`);
      stage.style.setProperty("--r", `${l.r}px`);
      stage.style.setProperty("--cy", `${l.cy}px`);
      stage.style.setProperty("--q-size", `${l.quoteSize}px`);
      stage.style.setProperty("--q-lines", String(l.quoteLines));
    };

    // ── Drag ────────────────────────────────────────────────────────────────
    let pending: { id: number; x: number; y: number } | null = null;
    let dragging = false;
    let lastX = 0;
    let lastMove = 0;
    let suppressClick = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (pending || dragging) return; // one pointer drives the wheel at a time
      pending = { id: e.pointerId, x: e.clientX, y: e.clientY };
      suppressClick = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (dragging) {
        if (!pending || e.pointerId !== pending.id) return;
        const d = (e.clientX - lastX) * DRAG;
        lastX = e.clientX;
        lastMove = performance.now();
        dragTarget += d;
        vel = d;
        return;
      }
      if (!pending || e.pointerId !== pending.id) return;
      const dx = Math.abs(e.clientX - pending.x);
      const dy = Math.abs(e.clientY - pending.y);
      if (dx > DRAG_THRESHOLD && dx > dy) {
        dragging = true;
        lastX = e.clientX;
        lastMove = performance.now();
        vel = 0;
        tween = null;
        dragTarget = rot;
        try {
          stage.setPointerCapture(e.pointerId);
        } catch {
          // pointer already gone (released mid-move): the drag still works without capture
        }
        stage.setAttribute("data-dragging", "");
        stopForGood();
      } else if (dy > DRAG_THRESHOLD) {
        pending = null; // vertical intent: leave it to the page scroll
      }
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (!pending || e.pointerId !== pending.id) return;
      pending = null;
      if (!dragging) return;
      dragging = false;
      suppressClick = true;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
      stage.removeAttribute("data-dragging");
      if (performance.now() - lastMove > FLING_WINDOW) vel = 0;
      if (reducedMotion.matches) {
        vel = 0;
        return;
      }
      // Carry the fling's momentum, then glide onto the nearest card instead of stopping mid-slot.
      const coast = vel * (INERTIA / (1 - INERTIA));
      vel = 0;
      tween = { from: rot, to: stepTarget(dragTarget + coast, 0), start: null, ms: SETTLE_MS };
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    // ── Keyboard ────────────────────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!delta) return;
      e.preventDefault();
      vel = 0;
      stopForGood();
      const to = stepTarget(tween ? tween.to : rot, delta);
      if (reducedMotion.matches) {
        tween = null;
        rot = to;
        apply();
      } else {
        tween = { from: rot, to, start: null, ms: STEP_MS };
      }
      const idx = nearestSlot(to) % count;
      if (liveRef.current) {
        liveRef.current.textContent = `Testimonial ${idx + 1} of ${count}: ${items[idx].name}`;
      }
    };

    // ── Frame loop ──────────────────────────────────────────────────────────
    const tick = (time: number) => {
      const k = lastTime === null ? 0 : frameSteps(time - lastTime);
      lastTime = time;
      if (dragging) {
        rot += (dragTarget - rot) * (1 - DRAG_EASE ** k);
        apply();
        return;
      }
      if (tween) {
        tween.start ??= time;
        const t = Math.min(1, (time - tween.start) / tween.ms);
        rot = tween.from + (tween.to - tween.from) * easeOutCubic(t);
        if (t >= 1) tween = null;
        apply();
        return;
      }
      if (reducedMotion.matches) return;
      const spin = autoSpinRate({ paused: pausedRef.current, hovered, focused });
      if (spin === 0 && Math.abs(vel) < 1e-3) {
        vel = 0; // fling has coasted to a stop and the drift is held: nothing to draw
        return;
      }
      rot += (vel + spin) * k;
      vel *= INERTIA ** k;
      apply();
    };

    // ── Drift holds (hover / focus) ─────────────────────────────────────────
    const onPointerEnter = () => { hovered = true; };
    const onPointerLeave = () => { hovered = false; };
    const onFocusIn = () => { focused = true; };
    const onFocusOut = (e: FocusEvent) => {
      if (!(e.relatedTarget instanceof Node && stage.contains(e.relatedTarget))) focused = false;
    };

    let inView = false;
    let unsubscribe: (() => void) | null = null;
    const sync = () => {
      const run = inView && !document.hidden;
      if (run && !unsubscribe) {
        lastTime = null;
        unsubscribe = subscribeToTicker(tick, () => 0);
      } else if (!run && unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };

    layout();
    apply();
    const resize = new ResizeObserver(layout);
    resize.observe(stage);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerEnd);
    stage.addEventListener("pointercancel", onPointerEnd);
    stage.addEventListener("click", onClickCapture, true);
    stage.addEventListener("keydown", onKeyDown);
    stage.addEventListener("pointerenter", onPointerEnter);
    stage.addEventListener("pointerleave", onPointerLeave);
    stage.addEventListener("focusin", onFocusIn);
    stage.addEventListener("focusout", onFocusOut);

    return () => {
      unsubscribe?.();
      resize.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerEnd);
      stage.removeEventListener("pointercancel", onPointerEnd);
      stage.removeEventListener("click", onClickCapture, true);
      stage.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener("pointerenter", onPointerEnter);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("focusin", onFocusIn);
      stage.removeEventListener("focusout", onFocusOut);
    };
  }, [count, items]);

  return (
    <>
      <div
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
        style={DEFAULT_VARS}
        className="absolute inset-0 z-[2] cursor-grab touch-pan-y touch-pinch-zoom select-none [--top:0.48] portrait:[--top:0.56] focus-visible:-outline-offset-8 data-dragging:cursor-grabbing"
      >
        {children}
        <p ref={liveRef} aria-live="polite" className="sr-only" />
        <div
          ref={wheelRef}
          aria-hidden="true"
          className="absolute left-1/2 top-(--cy) size-0 [transform:translate(-50%,-50%)_rotate(var(--rot))] [will-change:transform]"
        >
          {Array.from({ length: SLOTS }, (_, i) => {
            const t = items[i % count];
            return (
              <figure
                key={i}
                data-top={i === 0 ? "" : undefined}
                style={{ "--a": `${i * SLOT_DEG}deg` } as CSSProperties}
                className="absolute left-0 top-0 -ml-[calc(var(--cw)/2)] -mt-[calc(var(--ch)/2)] flex h-(--ch) w-(--cw) flex-col gap-4 rounded-2xl border border-line bg-surface p-6 [transform:rotate(var(--a))_translateY(calc(var(--r)*-1))] data-top:border-line-strong"
              >
                <div className="flex gap-1 text-brand">
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star key={s} />
                  ))}
                  <span className="sr-only">5 out of 5 stars</span>
                </div>
                <blockquote className="min-h-0 flex-1">
                  <p className="line-clamp-(--q-lines) font-display text-(length:--q-size) font-medium leading-relaxed text-fg">
                    {t.quote}
                  </p>
                </blockquote>
                <figcaption className="text-sm leading-5 text-muted">
                  <span className="block truncate text-fg">{t.name}</span>
                  <span className="line-clamp-2">
                    {t.source} · {t.location ? `${t.location}, ` : ""}
                    {t.date}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      {/* Top-left UI — source label, live counter, summary. In front of the fan. */}
      <div className="pointer-events-none absolute right-gutter items-end text-right top-24 md:top-32 z-[4] flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        <span className="text-fg">Upwork · Clutch</span>
        <span className="flex items-center gap-3">
          <span aria-hidden="true" className="flex items-center gap-3 tabular-nums">
            <span ref={counterRef} className="font-bold text-fg">
              {pad2(1)}
            </span>
            <span className="h-px w-[1.375rem] bg-line-strong" />
            <span>{pad2(count)}</span>
          </span>
          <button
            type="button"
            onClick={togglePaused}
            aria-pressed={paused}
            aria-label={paused ? "Play testimonials" : "Pause testimonials"}
            className="pointer-events-auto -my-2 flex size-8 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:text-fg"
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </span>
        <span className="font-normal normal-case tracking-normal">
          {`${count} verified reviews · Upwork & Clutch`}
        </span>
      </div>
    </>
  );
};
