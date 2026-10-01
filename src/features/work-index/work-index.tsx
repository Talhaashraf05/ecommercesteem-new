"use client";

// The /work index: every case study as one editorial row, filterable by channel.
//
// Hover (a fine pointer that can hover, motion allowed): a single fixed preview frame
// follows the cursor, showing the hovered row's photo. Its position is eased on the
// shared ticker (frame-rate independent lerp), subscribed only while the pointer is
// inside the list; show/hide is a declarative spring toggled by `active`. All preview
// photos sit stacked in that one frame and mount on the first hover, so switching rows
// never waits on a download. The hovered row's text nudges right and the others dim.
//
// Touch, small screens and reduced motion: no preview; each row shows a thumbnail.
// The split is a CSS media query, so SSR markup and first paint already match.
//
// Filtering is FLIP (as WorkGrid was): row rects are read in the click handler, before
// the state change; after React commits, a layout effect clears old transforms, reads
// every new rect, then writes the inverse transforms (reads batched before writes) and
// eases them to zero on the ticker. Entering rows fade in. A new filter mid-run cancels
// the old run. Reduced motion re-lays out instantly.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { animated, useSpring, type Interpolation } from "@react-spring/web";
import type { ServiceSlug } from "@/content/service-slugs";
import { ArrowIcon } from "@/components/ui/icons";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { WORK_GROUPS, inGroup, type WorkGroup } from "./groups";
import { previewPosition } from "./preview-math";

export interface WorkIndexItem {
  slug: string;
  client: string;
  category: string;
  year: string;
  headline: { value: string; label: string };
  services: ServiceSlug[];
  /** Display names for `services`, resolved on the server. */
  serviceNames: string[];
  image: string;
}

export interface WorkIndexCopy {
  columns: { client: string; result: string; services: string };
  filterLabel: string;
  /** `{n}` is the visible count; `{group}` the chip label (removed for "All"). */
  count: string;
  countOne: string;
  empty: string;
}

export interface WorkIndexProps {
  items: WorkIndexItem[];
  copy: WorkIndexCopy;
}

/** Devices that get the floating preview; the rest get row thumbnails (same query in CSS below). */
const PREVIEW_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
/** Thumbnails show everywhere the preview doesn't. */
const THUMB = "[@media(hover:hover)_and_(pointer:fine)]:motion-safe:hidden";

const FLIP_MS = 320;
const FOLLOW = 0.18; // share of the remaining distance covered per 60 fps frame
const FRAME_MS = 1000 / 60;
const SHIFT_REM = 0.5;
const DIM = 0.45;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const pad = (n: number) => String(n).padStart(2, "0");

interface Snapshot {
  rect: DOMRect;
  opacity: number;
}

interface RowProps {
  item: WorkIndexItem;
  index: number;
  /** This row is hovered. */
  current: boolean;
  /** Another row is hovered. */
  dimmed: boolean;
  onHover: (slug: string) => void;
}

const Row = ({ item, index, current, dimmed, onHover }: RowProps) => {
  const { x, o } = useSpring({ x: current ? SHIFT_REM : 0, o: dimmed ? DIM : 1, config: { tension: 260, friction: 30 } });
  const shift = x.to((v) => (v === 0 ? "none" : `translate3d(${v}rem, 0, 0)`));

  // Mobile: [thumb + name | arrow], then the result and services full width.
  // Desktop: one 12-column line — index, name, result, services, arrow.
  return (
    <Link
      href={`/work/${item.slug}`}
      onPointerEnter={() => onHover(item.slug)}
      className="group block border-t border-line py-7 outline-offset-4 md:py-9"
    >
      <animated.div
        style={{ opacity: o }}
        className="grid grid-cols-[1fr_auto] items-center gap-x-4 lg:grid-cols-12 lg:gap-x-8"
      >
        <Cell shift={shift} className="hidden lg:col-start-1 lg:row-start-1 lg:block">
          <span aria-hidden="true" className="text-kicker tabular-nums text-muted">
            {pad(index + 1)}
          </span>
        </Cell>

        <Cell shift={shift} className="col-start-1 row-start-1 flex min-w-0 items-center gap-4 md:gap-5 lg:col-span-4 lg:col-start-2">
          <span className={`relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-surface md:size-20 ${THUMB}`}>
            <Image src={item.image} alt="" fill sizes="8rem" className="object-cover" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-display-sm font-semibold leading-title tracking-title text-fg">
              {item.client}
            </h3>
            <span className="mt-2 block text-sm text-muted">
              {item.category}
              {/* Real spaces, so the row's accessible name doesn't read "Retail2024". */}
              <span className="whitespace-pre px-1"> · </span>
              {item.year}
            </span>
          </div>
        </Cell>

        <Cell shift={shift} className="col-span-2 mt-6 lg:col-span-3 lg:col-start-6 lg:row-start-1 lg:mt-0">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 lg:flex-col lg:gap-1.5">
            <span className="font-display text-3xl font-semibold leading-none tracking-title text-brand">
              {item.headline.value}
            </span>
            <span className="text-sm text-fg">{item.headline.label}</span>
          </span>
        </Cell>

        <Cell shift={shift} className="col-span-2 mt-3 lg:col-span-3 lg:col-start-9 lg:row-start-1 lg:mt-0">
          {/* One service per line on desktop; a dotted run on mobile. The separator stays
              in the accessible name (sr-only on desktop) so names never run together. */}
          <span className="flex flex-wrap text-sm text-muted lg:flex-col lg:gap-1">
            {item.serviceNames.map((name, i) => (
              <span key={name}>
                {i > 0 && <span className="whitespace-pre lg:sr-only"> · </span>}
                {name}
              </span>
            ))}
          </span>
        </Cell>

        <span
          aria-hidden="true"
          className="col-start-2 row-start-1 flex size-11 items-center justify-center rounded-full border border-line-strong text-fg transition-colors duration-200 group-hover:border-brand group-hover:bg-brand-strong group-focus-visible:border-brand group-focus-visible:bg-brand-strong md:size-12 lg:col-start-12 lg:justify-self-end"
        >
          <ArrowIcon className="size-4" />
        </span>
      </animated.div>
    </Link>
  );
};

const Cell = ({ shift, className, children }: { shift: Interpolation<number, string>; className: string; children: React.ReactNode }) => (
  <animated.div style={{ transform: shift }} className={className}>
    {children}
  </animated.div>
);

const PreviewImage = ({ src, on }: { src: string; on: boolean }) => {
  const style = useSpring({ opacity: on ? 1 : 0, config: { tension: 320, friction: 32 } });
  return (
    <animated.div style={style} className="absolute inset-0">
      <Image src={src} alt="" fill sizes="25rem" loading="eager" className="object-cover" />
    </animated.div>
  );
};

/** The single floating frame. `frameRef` is positioned by the parent's ticker loop. */
const Preview = ({
  items,
  shown,
  active,
  loaded,
  frameRef,
}: {
  items: WorkIndexItem[];
  shown: string | null;
  active: boolean;
  loaded: boolean;
  frameRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const style = useSpring({ opacity: active ? 1 : 0, scale: active ? 1 : 0.92, config: { tension: 300, friction: 28 } });
  return (
    <div
      ref={frameRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-40 w-[22rem] will-change-transform"
      style={{ transform: "translate3d(-200%, 0, 0)" }}
    >
      <animated.div
        style={style}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-card"
      >
        {loaded && items.map((item) => <PreviewImage key={item.slug} src={item.image} on={item.slug === shown} />)}
      </animated.div>
    </div>
  );
};

export const WorkIndex = ({ items, copy }: WorkIndexProps) => {
  const [group, setGroup] = useState<WorkGroup>("all");
  const [canPreview, setCanPreview] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null); // kept through the fade-out
  const [loaded, setLoaded] = useState(false);

  const rowEls = useRef(new Map<string, HTMLLIElement>());
  const snapshot = useRef<Map<string, Snapshot> | null>(null);
  const stopFlip = useRef<() => void>(() => {});

  const frameRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const stopFollow = useRef<(() => void) | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(PREVIEW_QUERY);
    const sync = () => setCanPreview(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const visible = items.filter((item) => inGroup(item.services, group));
  // Naming the group makes the live region change (and re-announce) even when two
  // groups have the same count.
  const groupLabel = group === "all" ? "" : (WORK_GROUPS.find((g) => g.id === group)?.label ?? "");
  const countText = (visible.length === 1 ? copy.countOne : copy.count)
    .replace("{n}", String(visible.length))
    .replace("{group}", groupLabel)
    .replace(/\s+/g, " ");

  // ---- Floating preview -------------------------------------------------------------

  const place = (x: number, y: number) => {
    const frame = frameRef.current;
    if (frame) frame.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  };

  const target = () => {
    const frame = frameRef.current;
    const w = frame?.offsetWidth ?? 0;
    const h = frame?.offsetHeight ?? 0;
    return previewPosition(pointer.current.x, pointer.current.y, w, h, document.documentElement.clientWidth, window.innerHeight);
  };

  const stopFollowing = () => {
    stopFollow.current?.();
    stopFollow.current = null;
  };

  const onListEnter = (e: React.PointerEvent) => {
    if (!canPreview || e.pointerType !== "mouse") return;
    pointer.current = { x: e.clientX, y: e.clientY };
    // Appear at the cursor rather than gliding in from the last exit point.
    pos.current = target();
    place(pos.current.x, pos.current.y);
    setLoaded(true);
    stopFollowing();
    let last: number | null = null;
    stopFollow.current = subscribeToTicker(
      (time) => {
        const dt = last === null ? FRAME_MS : Math.min(time - last, 100);
        last = time;
        const t = target();
        const k = 1 - Math.pow(1 - FOLLOW, dt / FRAME_MS);
        const dx = t.x - pos.current.x;
        const dy = t.y - pos.current.y;
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return;
        pos.current = { x: pos.current.x + dx * k, y: pos.current.y + dy * k };
        place(pos.current.x, pos.current.y);
      },
      () => 0,
    );
  };

  const onListMove = (e: React.PointerEvent) => {
    pointer.current = { x: e.clientX, y: e.clientY };
  };

  const onListLeave = () => {
    stopFollowing();
    setHovered(null);
  };

  const onRowHover = (slug: string) => {
    if (!canPreview) return;
    setHovered(slug);
    setShown(slug);
  };

  // Stop following on unmount, or when the device stops qualifying (e.g. reduced motion turned on).
  useEffect(() => {
    if (!canPreview) {
      stopFollowing();
      setHovered(null);
    }
    return stopFollowing;
  }, [canPreview]);

  // ---- Filtering (FLIP) ----------------------------------------------------------

  const select = (next: WorkGroup) => {
    if (next === group) return;
    // "First" positions, read before the state change (includes any in-flight transform).
    const snap = new Map<string, Snapshot>();
    rowEls.current.forEach((el, slug) => {
      snap.set(slug, { rect: el.getBoundingClientRect(), opacity: Number(getComputedStyle(el).opacity) });
    });
    snapshot.current = snap;
    setGroup(next);
  };

  useLayoutEffect(() => {
    const first = snapshot.current;
    if (!first) return;
    snapshot.current = null;
    stopFlip.current();
    stopFlip.current = () => {};

    const els = [...rowEls.current];
    // Writes: clear the previous run so "last" rects are the true layout.
    for (const [, el] of els) {
      el.style.transform = "";
      el.style.opacity = "";
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Reads: every "last" rect, before any new write.
    const lasts = els.map(([slug, el]) => ({ slug, el, last: el.getBoundingClientRect() }));
    const runs: { el: HTMLLIElement; dx: number; dy: number; o0: number }[] = [];
    for (const { slug, el, last } of lasts) {
      const prev = first.get(slug);
      const dx = prev ? prev.rect.left - last.left : 0;
      const dy = prev ? prev.rect.top - last.top : 0;
      const o0 = prev ? prev.opacity : 0;
      if (dx === 0 && dy === 0 && o0 >= 1) continue;
      runs.push({ el, dx, dy, o0 });
    }
    if (runs.length === 0) return;

    const paint = (e: number) => {
      for (const r of runs) {
        r.el.style.transform = r.dx || r.dy ? `translate3d(${r.dx * (1 - e)}px, ${r.dy * (1 - e)}px, 0)` : "";
        r.el.style.opacity = r.o0 < 1 ? String(r.o0 + (1 - r.o0) * e) : "";
      }
    };
    paint(0);

    let t0: number | null = null;
    const unsubscribe = subscribeToTicker(
      (time) => {
        if (t0 === null) t0 = time;
        const t = Math.min((time - t0) / FLIP_MS, 1);
        paint(easeOutCubic(t));
        if (t >= 1) {
          for (const r of runs) {
            r.el.style.transform = "";
            r.el.style.opacity = "";
          }
          stop();
        }
      },
      () => 0,
    );
    const stop = () => {
      unsubscribe();
      stopFlip.current = () => {};
    };
    stopFlip.current = stop;
  }, [group]);

  // Cancel an in-flight run on unmount.
  useLayoutEffect(() => () => stopFlip.current(), []);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label={copy.filterLabel} className="flex flex-wrap gap-2">
          {WORK_GROUPS.map((g) => {
            const pressed = g.id === group;
            const n = items.filter((item) => inGroup(item.services, g.id)).length;
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => select(g.id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors duration-200 ${
                  pressed
                    ? "border-brand bg-brand-strong text-fg"
                    : "border-line-strong bg-surface-glass text-muted hover:bg-surface-glass-hover hover:text-fg"
                }`}
              >
                {g.label}
                <span aria-hidden="true" className={`tabular-nums ${pressed ? "text-fg/80" : "text-muted/70"}`}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="text-sm text-muted">
          {countText}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 rounded-3xl border border-dashed border-line-strong p-12 text-center text-lead text-muted">
          {copy.empty}
        </p>
      ) : (
        <div className="mt-14">
          <div aria-hidden="true" className="hidden gap-8 pb-4 text-kicker uppercase tracking-widest text-muted lg:grid lg:grid-cols-12">
            <span className="col-span-4 col-start-2">{copy.columns.client}</span>
            <span className="col-span-3">{copy.columns.result}</span>
            <span className="col-span-3">{copy.columns.services}</span>
          </div>
          <ul onPointerEnter={onListEnter} onPointerMove={onListMove} onPointerLeave={onListLeave} className="border-b border-line">
            {visible.map((item, i) => (
              <li
                key={item.slug}
                ref={(el) => {
                  if (el) rowEls.current.set(item.slug, el);
                  else rowEls.current.delete(item.slug);
                }}
              >
                <Row
                  item={item}
                  index={i}
                  current={hovered === item.slug}
                  dimmed={hovered !== null && hovered !== item.slug}
                  onHover={onRowHover}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {canPreview && <Preview items={items} shown={shown} active={hovered !== null} loaded={loaded} frameRef={frameRef} />}
    </div>
  );
};
