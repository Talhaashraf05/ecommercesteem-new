"use client";

// Filterable case-study grid for /work. SSR renders the "All" state. Chips are toggle
// buttons (aria-pressed) and a polite live region announces the visible count.
// Re-layout on filter is FLIP: card rects are read in the click handler (before the
// state change), and after React commits a layout effect applies the inverse translate
// and eases it to zero on the shared ticker. Cards that enter fade in. A new filter
// mid-run cancels the old run; since rects include in-flight transforms, the next run
// starts from where cards are on screen. Reduced motion skips it (instant re-layout).
import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ServiceSlug } from "@/content/service-slugs";
import { Hover } from "@/components/animation/springs/hover";
import { HoverRing } from "@/components/ui/hover-ring";
import { ArrowIcon } from "@/components/ui/icons";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { WORK_GROUPS, inGroup, type WorkGroup } from "./groups";

export interface WorkGridItem {
  slug: string;
  client: string;
  category: string;
  headline: { value: string; label: string };
  services: ServiceSlug[];
  /** Display names for `services`, resolved on the server. */
  serviceNames: string[];
  image: string;
}

export interface WorkGridCopy {
  filterLabel: string;
  /** `{n}` is the visible count; `{group}` the chip label (removed for "All"). */
  count: string;
  countOne: string;
  empty: string;
}

export interface WorkGridProps {
  items: WorkGridItem[];
  copy: WorkGridCopy;
}

const FLIP_MS = 300;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface Snapshot {
  rect: DOMRect;
  opacity: number;
}

const Card = ({ item }: { item: WorkGridItem }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  return (
    <HoverRing className="h-full rounded-3xl">
      <Link
        ref={linkRef}
        href={`/work/${item.slug}`}
        aria-label={`${item.client} case study: ${item.headline.value} ${item.headline.label}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface-glass backdrop-blur-md transition-colors duration-200 hover:bg-surface-glass-hover"
      >
        <div className="relative aspect-[8/5] overflow-hidden">
          <Hover trigger={linkRef} from={{ scale: 1 }} to={{ scale: 1.06 }} config={{ tension: 170, friction: 26 }} className="absolute inset-0">
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />
          </Hover>
          <Hover
            trigger={linkRef}
            from={{ opacity: 0 }}
            to={{ opacity: 0.35 }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-bg"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg/80 to-transparent"
          />
          <span className="absolute left-4 top-4 rounded-full border border-line-strong bg-bg/70 px-3 py-1 text-kicker text-fg backdrop-blur-md">
            {item.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-h3 font-semibold leading-title tracking-title text-fg">{item.client}</h3>
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-fg transition-colors duration-200 group-hover:border-brand group-hover:bg-brand-strong group-focus-visible:border-brand group-focus-visible:bg-brand-strong"
            >
              <ArrowIcon className="size-3.5" />
            </span>
          </div>
          <Hover trigger={linkRef} from={{ y: 8 }} to={{ y: 0 }} className="mt-auto pt-6">
            <p className="flex flex-col gap-2">
              <span className="font-display text-4xl font-semibold leading-none tracking-title text-brand-glow">
                {item.headline.value}
              </span>
              <span className="text-muted">{item.headline.label}</span>
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {item.serviceNames.map((name) => (
                <li key={name} className="rounded-full border border-line px-3 py-1 text-kicker text-muted">
                  {name}
                </li>
              ))}
            </ul>
          </Hover>
        </div>
      </Link>
    </HoverRing>
  );
};

export const WorkGrid = ({ items, copy }: WorkGridProps) => {
  const [group, setGroup] = useState<WorkGroup>("all");
  const cardEls = useRef(new Map<string, HTMLLIElement>());
  const snapshot = useRef<Map<string, Snapshot> | null>(null);
  const stopRun = useRef<() => void>(() => {});

  const visible = items.filter((item) => inGroup(item.services, group));
  // Naming the group makes the live region change (and re-announce) even when two
  // groups have the same count.
  const groupLabel = group === "all" ? "" : (WORK_GROUPS.find((g) => g.id === group)?.label ?? "");
  const countText = (visible.length === 1 ? copy.countOne : copy.count)
    .replace("{n}", String(visible.length))
    .replace("{group}", groupLabel)
    .replace(/\s+/g, " ");

  const select = (next: WorkGroup) => {
    if (next === group) return;
    // "First" positions, read before the state change (includes any in-flight transform).
    const snap = new Map<string, Snapshot>();
    cardEls.current.forEach((el, slug) => {
      snap.set(slug, { rect: el.getBoundingClientRect(), opacity: Number(getComputedStyle(el).opacity) });
    });
    snapshot.current = snap;
    setGroup(next);
  };

  useLayoutEffect(() => {
    const first = snapshot.current;
    if (!first) return;
    snapshot.current = null;
    stopRun.current();
    stopRun.current = () => {};

    const runs: { el: HTMLLIElement; dx: number; dy: number; o0: number }[] = [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cardEls.current.forEach((el, slug) => {
      el.style.transform = "";
      el.style.opacity = "";
      if (reduce) return;
      const last = el.getBoundingClientRect();
      const prev = first.get(slug);
      const dx = prev ? prev.rect.left - last.left : 0;
      const dy = prev ? prev.rect.top - last.top : 0;
      const o0 = prev ? prev.opacity : 0;
      if (dx === 0 && dy === 0 && o0 >= 1) return;
      runs.push({ el, dx, dy, o0 });
    });
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
      stopRun.current = () => {};
    };
    stopRun.current = stop;
  }, [group]);

  // Cancel an in-flight run on unmount.
  useLayoutEffect(() => () => stopRun.current(), []);

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
        <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <li
              key={item.slug}
              ref={(el) => {
                if (el) cardEls.current.set(item.slug, el);
                else cardEls.current.delete(item.slug);
              }}
            >
              <Card item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
