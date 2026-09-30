"use client";

// Row of full-height service columns split by thin vertical lines — ported from
// Stride's showcase. On lg, hovering a column reveals its photo bottom-to-top through
// a clip-path mask, a dark scrim scales up from the base behind the label, and a thin
// brand line draws in along the bottom — all springs via <Hover> (ADR-0002). The whole
// column is the hover trigger and the link (a clip-collapsed element has no hit area).
// The heading + CTA sit over the top-right on lg without blocking column hover. On
// touch widths — and under reduced motion at every width — the photo is always
// visible with a fixed dark scrim, and the spring layers are hidden.
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Hover } from "@/components/animation/springs/hover";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { ButtonLink } from "@/components/ui/button";

export interface ServiceColumnItem {
  prefix: string;
  name: string;
  /** Column image (public path). */
  image: string;
  href: string;
}

export interface ServiceColumnsProps {
  heading: string;
  cta: { label: string; href: string };
  items: ServiceColumnItem[];
}

const REVEAL_CONFIG = { tension: 170, friction: 26 };
const HEADING_ID = "service-columns-title";
const LABEL = "block font-display text-2xl font-semibold leading-[1.05] tracking-tight text-fg lg:text-4xl";

const pad = (n: number) => String(n).padStart(2, "0");

const Column = ({ prefix, name, image, href, index }: ServiceColumnItem & { index: number }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      href={href}
      ref={ref}
      className="group relative block min-h-[38vh] overflow-hidden rounded-2xl bg-surface focus-visible:-outline-offset-4 lg:min-h-[85vh] lg:rounded-none lg:bg-transparent"
    >
      {/* Touch widths have no hover: the photo is always visible (as a card). */}
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
        className="object-cover lg:hidden lg:motion-reduce:block!"
      />

      {/* lg+: photo revealed bottom-to-top through a clip-path mask on hover. */}
      <Hover
        trigger={ref}
        tag="div"
        className="absolute inset-0 hidden will-change-[clip-path] lg:block motion-reduce:hidden!"
        from={{ clipPath: "inset(100% 0% 0% 0%)" }}
        to={{ clipPath: "inset(0% 0% 0% 0%)" }}
        config={REVEAL_CONFIG}
      >
        <Image src={image} alt="" fill sizes="25vw" className="object-cover" />
      </Hover>

      {/* Label contrast: a fixed dark scrim on touch widths; on lg a dark scrim that
          scales up from the base on hover. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg via-bg/60 to-transparent lg:hidden lg:motion-reduce:block!"
      />
      <Hover
        trigger={ref}
        tag="div"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 origin-bottom bg-gradient-to-t from-bg via-bg/70 to-transparent will-change-transform lg:block motion-reduce:hidden!"
        from={{ transform: "scaleY(0)" }}
        to={{ transform: "scaleY(1)" }}
        config={REVEAL_CONFIG}
      />

      <div className="pointer-events-none absolute inset-x-5 bottom-6 lg:inset-x-6 lg:bottom-12">
        <span aria-hidden="true" className="mb-3 block text-sm font-medium tabular-nums tracking-wide text-fg/40 lg:mb-5">
          {pad(index + 1)}
        </span>
        <span className={LABEL}>{prefix}</span>
        <span className={LABEL}>{name}</span>
      </div>

      {/* lg+: thin brand line that draws in along the base on hover. */}
      <Hover
        trigger={ref}
        tag="div"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 bottom-6 hidden h-px origin-left bg-brand will-change-transform lg:block motion-reduce:hidden!"
        from={{ transform: "scaleX(0)" }}
        to={{ transform: "scaleX(1)" }}
        config={REVEAL_CONFIG}
      />
      {/* Reduced motion: the brand line appears statically on hover/focus (no spring). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 bottom-6 hidden h-px bg-brand opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 lg:motion-reduce:block"
      />
    </Link>
  );
};

export const ServiceColumns = ({ heading, cta, items }: ServiceColumnsProps) => (
  <section
    aria-labelledby={HEADING_ID}
    className="relative overflow-hidden border-y border-line bg-bg text-fg"
  >
    {/* Heading + CTA: in flow above the cards on touch widths; on lg overlaid on the
        right half and pointer-events-none so the columns stay hoverable (the button
        re-enables its own). */}
    <div className="relative z-10 px-gutter pb-10 pt-14 lg:pointer-events-none lg:absolute lg:left-1/2 lg:right-0 lg:top-14 lg:z-20 lg:px-12 lg:pb-0">
      <AnimatedHeading
        as="h2"
        id={HEADING_ID}
        className="font-display text-display-sm font-semibold leading-title tracking-title"
      >
        {heading}
      </AnimatedHeading>
      <ButtonLink href={cta.href} variant="secondary" withArrow className="pointer-events-auto mt-8">
        {cta.label}
      </ButtonLink>
    </div>

    {/* Cards: a 2-column grid on touch widths; full-height, edge-to-edge, lined
        columns on lg (the hover showcase). */}
    <div className="grid grid-cols-2 gap-4 px-gutter pb-6 sm:gap-5 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line lg:px-0 lg:pb-0">
      {items.map((item, i) => (
        <Column key={item.href} index={i} {...item} />
      ))}
    </div>
  </section>
);
