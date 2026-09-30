"use client";

// Testimonial wheel — cards on the rim of a large circle whose centre sits below the
// section, fanning across the top like a spread hand. Slow idle drift, drag to spin
// with inertia, arrow keys step one slot. One `--rot` custom property on the wheel is
// written per frame from the shared ticker (ADR-0015); nothing calls setState, so the
// component never re-renders while it moves. The loop is unsubscribed while the
// section is off-screen or the tab is hidden.
//
// Phones: the stage is `touch-action: pan-y`, and a drag only starts once horizontal
// movement dominates, so vertical page scroll is never trapped.
// Reduced motion: no drift, no inertia, keyboard steps land instantly; drag still works.
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Testimonial } from "@/content/schemas";
import { subscribeToTicker } from "@/lib/animation/ticker";
import {
  AUTO_SPIN,
  DRAG,
  INERTIA,
  SLOT_DEG,
  SLOTS,
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

// Pre-mount defaults: the same maths as wheelLayout() in CSS, against the section's
// box (h-lvh, min 40rem), so the fan is in place before hydration and doesn't move.
const SECTION_H = "max(100lvh, 40rem)";
const DEFAULT_VARS = {
  "--ch": `max(19.5rem, min(calc(${SECTION_H} * 0.42), 50vw, 26rem))`,
  "--cw": "calc(var(--ch) * 0.82)",
  "--r": "max(70vw, calc(var(--cw) * 4))",
  "--cy": `calc(${SECTION_H} * 0.48 + var(--r))`,
  "--q-size": "clamp(0.9375rem, calc(var(--ch) * 0.05), 1.25rem)",
  "--q-lines": "6",
  "--rot": "0deg",
} as CSSProperties;

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
    let tween: { from: number; to: number; start: number | null } | null = null;

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
      pending = { id: e.pointerId, x: e.clientX, y: e.clientY };
      suppressClick = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (dragging) {
        const d = (e.clientX - lastX) * DRAG;
        lastX = e.clientX;
        lastMove = performance.now();
        rot += d;
        vel = d;
        apply();
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
        stage.setPointerCapture(e.pointerId);
        stage.setAttribute("data-dragging", "");
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
      if (reducedMotion.matches || performance.now() - lastMove > FLING_WINDOW) vel = 0;
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
      const to = stepTarget(tween ? tween.to : rot, delta);
      if (reducedMotion.matches) {
        tween = null;
        rot = to;
        apply();
      } else {
        tween = { from: rot, to, start: null };
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
      if (tween) {
        tween.start ??= time;
        const t = Math.min(1, (time - tween.start) / STEP_MS);
        rot = tween.from + (tween.to - tween.from) * easeOutCubic(t);
        if (t >= 1) tween = null;
        apply();
        return;
      }
      if (dragging || reducedMotion.matches) return;
      rot += (vel + AUTO_SPIN) * k;
      vel *= INERTIA ** k;
      apply();
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
        className="absolute inset-0 z-[2] cursor-grab touch-pan-y select-none focus-visible:-outline-offset-8 data-dragging:cursor-grabbing"
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
      <div className="pointer-events-none absolute left-gutter top-[calc(4.5rem+clamp(0.625rem,2.5vh,2.5rem))] z-[4] flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        <span className="text-fg">Upwork · Clutch</span>
        <span aria-hidden="true" className="flex items-center gap-3 tabular-nums">
          <span ref={counterRef} className="font-bold text-fg">
            {pad2(1)}
          </span>
          <span className="h-px w-[1.375rem] bg-line-strong" />
          <span>{pad2(count)}</span>
        </span>
        <span className="font-normal normal-case tracking-normal">
          {`${count} verified reviews · Upwork & Clutch`}
        </span>
      </div>
    </>
  );
};
