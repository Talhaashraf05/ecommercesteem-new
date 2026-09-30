"use client";

// "Selected work" — a scroll-driven 3D card stack, ported from Stride's works section.
// The section is pinned (sticky) over a tall scroll region; scroll progress advances a
// float index `f`, and each card is transformed in perspective from that index so cards
// travel bottom-to-top on a cylinder, tilting through the focus. `f` is a react-spring
// value the shared ticker feeds from a low-passed scroll read (ADR-0015); nothing calls
// setState while scrolling, so the component never re-renders mid-scroll. The metadata
// row (index, client, headline, case-study link) is updated imperatively via refs.
// Reduced motion: no ticker subscription, section height auto, cards as a static grid.
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { animated, useSpringValue } from "@react-spring/web";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { AnimatedHeading } from "@/components/ui/animated-heading";

export interface PortfolioStackItem {
  slug: string;
  client: string;
  headline: string;
  /** Card image (public path). */
  image: string;
}

export interface PortfolioStackProps {
  heading: string;
  items: PortfolioStackItem[];
  /** Eager-load the first card image when the stack is above the fold (/work). The blurred backdrop stays lazy so it does not compete with the LCP image. */
  priority?: boolean;
  /** "h1" when the stack is the page hero (/work); omitted, AnimatedHeading renders its default "h2" (home). */
  headingAs?: "h1" | "h2";
}

const SCROLL_PER_CARD = 60; // vh of scroll per card
// Cards sit on a vertical cylinder, evenly spaced by arc so they never
// self-intersect. Vertical spacing between neighbours is RADIUS·sin(STEP) ≈ 730px,
// clear of the card height (≤ ~460px; width is also capped by viewport height so
// the focused card clears the heading on short screens).
const RADIUS = 1350; // px — cylinder radius
const STEP = 27; // deg between adjacent cards around the cylinder
// Index runs a small fraction past each end so the end cards stay near-centred with a
// hint of motion (no dead lead-in, no early exit).
const OVERSCAN = 0.2;
const FOLLOW = 0.14; // per-frame low-pass of the scroll read

const pad = (n: number) => String(n).padStart(2, "0");
const workHref = (slug: string) => `/work/${slug}`;
const linkLabel = (client: string) => `View case study: ${client}`;

const backdropFrame = (i: number, v: number) => ({
  opacity: Math.max(0, 1 - Math.abs(i - v)),
  transform: `translateY(${(i - v) * 22}%) scale(1.6)`,
});

const cardFrame = (i: number, v: number) => {
  const rel = i - v;
  const rad = (rel * STEP * Math.PI) / 180;
  const y = RADIUS * Math.sin(rad);
  const z = RADIUS * Math.cos(rad) - RADIUS; // focus at 0, others recede
  const d = Math.abs(i - v);
  return {
    transform: `translate3d(0px, ${y}px, ${z}px) rotateX(${rel * STEP}deg) translate(-50%, -50%)`,
    opacity: d > 3.6 ? 0 : Math.max(0, 1 - d * 0.24),
  };
};

const scrimOpacity = (i: number, v: number) => Math.min(0.45, Math.abs(i - v) * 0.25);

const PortfolioStackInner = ({ heading, items, priority = false, headingAs }: PortfolioStackProps) => {
  const count = items.length;
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const currentRef = useRef<number | null>(null); // low-passed follow value
  const idxRef = useRef(0);
  const indexElRef = useRef<HTMLSpanElement>(null);
  const nameElRef = useRef<HTMLSpanElement>(null);
  const headlineElRef = useRef<HTMLSpanElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const f = useSpringValue(0);
  // Flipped after mount so SSR markup matches; only affects card tab order.
  const [reduce, setReduce] = useState(false);
  // Above the fold (/work), only the first card's images are in the SSR markup so the
  // LCP image doesn't share bandwidth with the rest; the others mount after hydration.
  const [mounted, setMounted] = useState(!priority);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMounted(true);
    setReduce(reduced);
    if (reduced) return;
    return subscribeToTicker(
      () => {
        const el = sectionRef.current;
        if (!el) return;
        const total = el.offsetHeight - window.innerHeight; // pinned scroll length
        const p = Math.min(Math.max(-el.getBoundingClientRect().top / Math.max(1, total), 0), 1);
        const target = p * (count - 1 + OVERSCAN * 2) - OVERSCAN;
        // First frame snaps (deep link / restored scroll), then follows smoothly.
        const current =
          currentRef.current === null ? target : currentRef.current + (target - currentRef.current) * FOLLOW;
        currentRef.current = current;
        f.set(current);

        const idx = Math.min(count - 1, Math.max(0, Math.round(current)));
        if (idx !== idxRef.current) {
          idxRef.current = idx;
          const item = items[idx];
          if (indexElRef.current) indexElRef.current.textContent = pad(idx + 1);
          if (nameElRef.current) nameElRef.current.textContent = item.client;
          if (headlineElRef.current) headlineElRef.current.textContent = item.headline;
          if (linkRef.current) {
            linkRef.current.href = workHref(item.slug);
            linkRef.current.setAttribute("aria-label", linkLabel(item.client));
          }
        }
      },
      () => 0,
    );
  }, [f, count, items]);

  // next/link navigates to its `href` prop, which stays at the first item; route plain
  // clicks to the focused card instead. Modified clicks fall through to the browser,
  // which uses the (imperatively updated) DOM href.
  const onViewClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    router.push(workHref(items[idxRef.current].slug));
  };

  return (
    <section
      ref={sectionRef}
      aria-label={heading}
      className="relative bg-bg text-fg motion-reduce:h-auto! motion-reduce:px-gutter motion-reduce:py-24"
      style={{ height: `${100 + (count - 1) * SCROLL_PER_CARD}vh` }}
    >
      <div className="sticky top-0 h-lvh overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible">
        {/* Blurred backdrop — each card's photo, cross-fading to the focused one and
            drifting bottom-to-top with scroll, dimmed so cards and caption lead. */}
        <div className="absolute inset-0 motion-reduce:hidden" aria-hidden="true">
          {items.map((item, i) => (
            <animated.div
              key={item.slug}
              suppressHydrationWarning
              className="absolute inset-0 [will-change:transform,opacity]"
              style={{
                opacity: f.to((v) => backdropFrame(i, v).opacity),
                transform: f.to((v) => backdropFrame(i, v).transform),
              }}
            >
              {(mounted || i === 0) && (
                <Image src={item.image} alt="" fill sizes="60vw" quality={30} className="object-cover blur-2xl" />
              )}
            </animated.div>
          ))}
          <div className="absolute inset-0 bg-bg/60" />
        </div>

        <AnimatedHeading
          as={headingAs}
          className="absolute inset-x-0 top-24 z-30 px-gutter text-center font-display text-display-sm font-semibold leading-title tracking-title motion-reduce:static motion-reduce:mb-12 motion-reduce:px-0 motion-reduce:text-left"
        >
          {heading}
        </AnimatedHeading>

        {/* 3D stage — cards on a cylinder; preserve-3d sorts them by depth. */}
        <div className="absolute inset-0 [perspective:118.75rem] [transform-style:preserve-3d] motion-reduce:static motion-reduce:grid motion-reduce:gap-6 motion-reduce:[perspective:none] md:motion-reduce:grid-cols-2 lg:motion-reduce:grid-cols-3">
          {items.map((item, i) => (
            <animated.div
              key={item.slug}
              suppressHydrationWarning
              className="absolute left-1/2 top-1/2 aspect-[16/10] w-[min(90vw,46rem,max(16rem,calc((100lvh-22.5rem)*1.6)))] overflow-hidden rounded-3xl bg-surface shadow-2xl [backface-visibility:hidden] [will-change:transform] motion-reduce:static motion-reduce:w-full motion-reduce:opacity-100! motion-reduce:transform-none! motion-reduce:shadow-none"
              style={{
                transform: f.to((v) => cardFrame(i, v).transform),
                opacity: f.to((v) => cardFrame(i, v).opacity),
              }}
            >
              <Link
                href={workHref(item.slug)}
                aria-label={item.client}
                tabIndex={reduce ? undefined : -1}
                className="absolute inset-0 block focus-visible:-outline-offset-4"
              >
                {(mounted || i === 0) && (
                  <Image
                    src={item.image}
                    alt={item.client}
                    fill
                    sizes="(max-width: 768px) 90vw, 736px"
                    priority={priority && i === 0}
                    className="object-cover"
                  />
                )}
                {/* Scrim only on off-focus cards; the focused card stays clear. */}
                <animated.span
                  aria-hidden="true"
                  suppressHydrationWarning
                  className="absolute inset-0 bg-bg motion-reduce:hidden"
                  style={{ opacity: f.to((v) => scrimOpacity(i, v)) }}
                />
                {/* Static-grid caption (reduced motion only). */}
                <span className="absolute inset-x-0 bottom-0 hidden flex-col gap-1 bg-gradient-to-t from-bg via-bg/70 to-transparent p-6 pt-16 motion-reduce:flex">
                  <span className="font-display text-2xl font-semibold tracking-tight text-fg">{item.client}</span>
                  <span className="text-sm text-brand-glow">{item.headline}</span>
                </span>
              </Link>
            </animated.div>
          ))}
        </div>

        {/* Metadata row — index left, client + headline centred, case-study link right.
            Below sm it drops under the card: client + headline span the full width,
            index and link share the line beneath. */}
        <div className="pointer-events-none absolute inset-x-4 bottom-10 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] gap-y-5 text-sm tracking-wide sm:inset-x-8 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:gap-6 motion-reduce:hidden">
          <span className="row-start-2 justify-self-start rounded-full bg-bg/90 px-3 py-1 tabular-nums text-fg sm:row-start-1">
            <span ref={indexElRef}>{pad(1)}</span> / {pad(count)}
          </span>
          <span className="col-span-3 row-start-1 flex min-w-0 max-w-full flex-col items-center gap-1 justify-self-center rounded-2xl bg-bg/90 px-5 py-3 text-center backdrop-blur-md sm:col-span-1 sm:col-start-2">
            <span
              ref={nameElRef}
              className="max-w-full truncate font-display text-lg font-semibold leading-snug tracking-tight text-fg sm:text-2xl"
            >
              {items[0].client}
            </span>
            <span ref={headlineElRef} className="max-w-full truncate text-sm text-brand-glow">
              {items[0].headline}
            </span>
          </span>
          <Link
            ref={linkRef}
            href={workHref(items[0].slug)}
            aria-label={linkLabel(items[0].client)}
            onClick={onViewClick}
            className="pointer-events-auto col-start-3 row-start-2 justify-self-end whitespace-nowrap sm:row-start-1 rounded-full border border-line-strong bg-bg/90 px-4 py-2.5 text-sm font-medium text-fg backdrop-blur transition-colors duration-200 hover:border-fg/60 hover:text-fg sm:px-6 sm:py-3"
          >
            View case study
          </Link>
        </div>
      </div>
    </section>
  );
};

export const PortfolioStack = (props: PortfolioStackProps) =>
  props.items.length === 0 ? null : <PortfolioStackInner {...props} />;
