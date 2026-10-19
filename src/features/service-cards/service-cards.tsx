"use client";

// "What we run" as a growth flywheel: a glowing core ("One growth engine") with the four
// services around a dashed ring. Motion, all springs (ADR-0002) re-targeted by state or
// fed by the shared ticker — nothing self-runs:
//   - entrance: when the wheel scrolls into view the core pops in, then the nodes, staggered;
//   - scroll: the ring and its orbiting spark rotate with the page's scroll offset;
//   - hover / focus on a node: it lifts and glows, its summary unfolds, a spoke lights up
//     from the core to it, and the core swaps its label for that service's name.
// The wheel layout is lg+. Below lg there is no room (or hover), so the nodes stack as
// plain cards with their summaries open. Reduced motion skips springs globally and the
// scroll subscription. Each node is a link.
import { animated, useSpring, useSpringValue } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { serviceIcon } from "@/components/layout/service-icons";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { ButtonLink } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import type { Service } from "@/content/schemas";
import { subscribeToTicker } from "@/lib/animation/ticker";

export type ServiceCardItem = Pick<Service, "slug" | "name" | "shortName" | "tagline" | "summary" | "tags">;

export interface ServiceCardsProps {
  eyebrow: string;
  heading: string;
  lead: string;
  core: string;
  cta: { label: string; href: string };
  items: ServiceCardItem[];
}

const HEADING_ID = "service-cards-title";
const SOFT = { tension: 170, friction: 26 };
const SCROLL_DEG = 0.05; // ring degrees per px scrolled
const FOLLOW = 0.08; // per-frame low-pass toward the scroll target

// Node placement (lg+): two cards down the left, two down the right, each tied to the core by
// a curved spoke (100x100 spoke viewBox). The upper cards are pinned by their bottom edge and
// the lower cards by their top edge (a collapsed card is 11rem tall), so when a
// summary unfolds the card grows away from the core instead of over it.
const SLOTS = [
  { pos: "lg:left-0 lg:bottom-[calc(100%-14rem)]", spoke: "M50 50 C42 50 38 25 29 25" },
  { pos: "lg:left-0 lg:top-[20rem]", spoke: "M50 50 C42 50 38 75 29 75" },
  { pos: "lg:right-0 lg:bottom-[calc(100%-14rem)]", spoke: "M50 50 C58 50 62 25 71 25" },
  { pos: "lg:right-0 lg:top-[20rem]", spoke: "M50 50 C58 50 62 75 71 75" },
] as const;

const Node = ({
  item,
  index,
  seen,
  active,
  onActive,
}: {
  item: ServiceCardItem;
  index: number;
  seen: boolean;
  active: boolean;
  onActive: (on: boolean) => void;
}) => {
  const Icon = serviceIcon[item.slug];
  const enter = useSpring({
    o: seen ? 1 : 0,
    s: seen ? 1 : 0.88,
    delay: seen ? 350 + index * 120 : 0,
    config: SOFT,
  });
  const hover = useSpring({ g: active ? 1 : 0, config: SOFT });
  return (
    <animated.li
      style={{ opacity: enter.o }}
      className={`min-w-0 max-lg:!opacity-100 lg:absolute lg:w-[22rem] ${SLOTS[index].pos}`}
    >
      <animated.div
        style={{
          scale: enter.s,
          y: hover.g.to((g) => -6 * g),
          borderColor: hover.g.to((g) => `rgb(220 51 38 / ${0.14 + 0.7 * g})`),
          boxShadow: hover.g.to(
            (g) => `0 12px 40px rgb(0 0 0 / 0.4), 0 0 ${36 * g}px rgb(220 51 38 / ${0.35 * g})`,
          ),
        }}
        className="rounded-3xl border bg-surface/95 backdrop-blur-xl"
      >
        <Link
          href={`/services/${item.slug}`}
          onPointerEnter={(e) => e.pointerType === "mouse" && onActive(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && onActive(false)}
          onFocus={() => onActive(true)}
          onBlur={() => onActive(false)}
          className="block rounded-3xl p-5"
        >
          <div className="flex items-center gap-4 lg:min-h-[5.25rem]">
            <animated.span
              style={{ backgroundColor: hover.g.to((g) => `rgb(220 51 38 / ${0.12 + 0.88 * g})`) }}
              className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line-strong"
            >
              <animated.span
                style={{ color: hover.g.to((g) => `rgb(${220 + 35 * g} ${51 + 204 * g} ${38 + 217 * g})`) }}
                className="grid"
              >
                <Icon />
              </animated.span>
            </animated.span>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold leading-title text-fg">{item.shortName}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">{item.tagline}</p>
            </div>
          </div>
          <p className="mt-3 line-clamp-2 text-xs text-muted">{item.summary}</p>
          {/* Tags + link unfold on hover (lg); always open below lg. */}
          <animated.div
            style={{ maxHeight: hover.g.to((g) => `${g * 8.5}rem`), opacity: hover.g }}
            className="overflow-hidden max-lg:!max-h-none max-lg:!opacity-100"
          >
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.tags.slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line-strong bg-surface-glass px-2.5 py-0.5 text-[0.65rem] text-fg/80"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-fg">
              Learn more
              <ArrowIcon className="size-3.5 text-brand" aria-hidden="true" />
            </span>
          </animated.div>
        </Link>
      </animated.div>
    </animated.li>
  );
};

const Spoke = ({ d, on, seen }: { d: string; on: boolean; seen: boolean }) => {
  const s = useSpring({ o: seen ? (on ? 1 : 0.18) : 0, w: on ? 2.5 : 1, config: SOFT });
  return (
    <animated.path
      d={d}
      fill="none"
      stroke="var(--brand-glow)"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      style={{ opacity: s.o, strokeWidth: s.w }}
    />
  );
};

export const ServiceCards = ({ eyebrow, heading, lead, core, cta, items }: ServiceCardsProps) => {
  const [active, setActive] = useState<number | null>(null);
  const [seen, setSeen] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const rot = useSpringValue(0);

  // Entrance trigger.
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll-linked ring rotation, fed by the shared ticker.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cur = window.scrollY * SCROLL_DEG;
    rot.set(cur);
    return subscribeToTicker(
      () => {
        const target = window.scrollY * SCROLL_DEG;
        const next = cur + (target - cur) * FOLLOW;
        if (Math.abs(next - cur) < 1e-4) return;
        cur = next;
        rot.set(cur);
      },
      () => 0,
    );
  }, [rot]);

  const coreSpring = useSpring({ s: seen ? (active === null ? 1 : 1.08) : 0.6, o: seen ? 1 : 0, config: SOFT });
  const idle = useSpring({ o: active === null ? 1 : 0, config: SOFT });
  const label = useSpring({ o: active === null ? 0 : 1, config: SOFT });
  const shown = items[active ?? 0];

  return (
    <Section labelledBy={HEADING_ID} className="overflow-hidden border-y border-line">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-title">
            <p className="mb-4 text-eyebrow font-medium uppercase tracking-wider text-brand-glow">{eyebrow}</p>
            <AnimatedHeading
              as="h2"
              id={HEADING_ID}
              className="font-display text-display-sm font-semibold leading-title tracking-title text-fg"
            >
              {heading}
            </AnimatedHeading>
            <p className="mt-6 max-w-lead text-lead text-muted">{lead}</p>
          </div>
          <ButtonLink href={cta.href} variant="secondary" withArrow className="self-start lg:self-auto">
            {cta.label}
          </ButtonLink>
        </div>

        <div ref={wheelRef} className="relative mx-auto mt-14 max-w-[72rem] lg:mt-28 lg:h-[34rem]">
          {/* Wheel furniture: lg+ only. */}
          <animated.div
            aria-hidden="true"
            style={{ rotate: rot.to((d) => `${d}deg`), opacity: coreSpring.o }}
            className="pointer-events-none absolute left-1/2 top-1/2 hidden aspect-square h-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/20 lg:block"
          >
            <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-brand-glow shadow-[0_0_1.25rem_var(--brand-glow)]" />
            <span className="absolute -bottom-1.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-white/40" />
          </animated.div>

          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 hidden size-full lg:block"
          >
            {SLOTS.map((slot, i) => (
              <Spoke key={slot.spoke} d={slot.spoke} on={active === i} seen={seen} />
            ))}
          </svg>

          <animated.div
            aria-hidden="true"
            style={{ opacity: coreSpring.o, scale: coreSpring.s }}
            className="pointer-events-none absolute left-1/2 top-1/2 hidden size-[12rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand)_55%,transparent),color-mix(in_srgb,var(--brand)_6%,transparent)_70%)] text-center shadow-[0_0_5rem_color-mix(in_srgb,var(--brand)_40%,transparent)] lg:grid"
          >
            <animated.p
              style={{ opacity: idle.o }}
              className="absolute px-6 font-display text-lg font-semibold leading-title text-fg"
            >
              {core}
            </animated.p>
            <animated.div style={{ opacity: label.o }} className="absolute px-5">
              <p className="font-display text-lg font-semibold leading-title text-fg">{shown.shortName}</p>
              <p className="mt-1 text-kicker uppercase tracking-wider text-fg/70">{shown.tagline}</p>
            </animated.div>
          </animated.div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:block">
            {items.map((item, i) => (
              <Node
                key={item.slug}
                item={item}
                index={i}
                seen={seen}
                active={active === i}
                onActive={(on) => setActive((cur) => (on ? i : cur === i ? null : cur))}
              />
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
};
