"use client";

// "What we run": a heading row, then four compact service cards in a row (two by two on
// tablets, one per row on phones). Each card is a photo, the service name, a short plain
// description and a link; the whole card links to the service page.
// Hover: the card lifts, its photo eases in, and a soft red spotlight fades in and follows
// the mouse across the card (the pointer position is written to --mx / --my on the card,
// never through state). Lift, zoom and spotlight fade are springs via <Hover> (ADR-0002);
// the border colour is a plain colour transition. Touch and reduced motion get none of it.
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Hover } from "@/components/animation/springs/hover";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { ButtonLink } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import type { Service } from "@/content/schemas";

export type ServiceCardItem = Pick<Service, "slug" | "name" | "tagline" | "summary" | "image">;

export interface ServiceCardsProps {
  eyebrow: string;
  heading: string;
  lead: string;
  cta: { label: string; href: string };
  items: ServiceCardItem[];
}

const HEADING_ID = "service-cards-title";
const SOFT = { tension: 170, friction: 26 };

const Card = ({ item }: { item: ServiceCardItem }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <li className="min-w-0">
      <Hover tag="div" from={{ y: 0 }} to={{ y: -8 }} config={SOFT} className="h-full">
        <Link
          ref={ref}
          href={`/services/${item.slug}`}
          onPointerMove={onPointerMove}
          className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface-card transition-colors duration-200 hover:border-brand/50 focus-visible:border-brand"
        >
          <div className="relative aspect-3/2 overflow-hidden">
            <Hover trigger={ref} tag="div" from={{ scale: 1 }} to={{ scale: 1.07 }} config={SOFT} className="absolute inset-0">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw"
                className="object-cover"
              />
            </Hover>
            {/* A light dark veil so bright stock photos don't glare against the dark page. */}
            <span aria-hidden="true" className="absolute inset-0 bg-bg/30" />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-display text-xl font-semibold leading-title tracking-title text-fg">{item.name}</h3>
            <p className="mt-1.5 text-xs uppercase tracking-wider text-brand-glow">{item.tagline}</p>
            <p className="mt-4 line-clamp-2 text-sm text-muted">{item.summary}</p>
            <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-fg">
              Learn more
              <ArrowIcon className="size-3.5 text-brand" aria-hidden="true" />
            </span>
          </div>
          {/* Mouse spotlight: fades in on hover, centred on the pointer. */}
          <Hover
            trigger={ref}
            tag="div"
            aria-hidden="true"
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            config={SOFT}
            className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(16rem_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_srgb,var(--brand)_22%,transparent),transparent_65%)] md:block motion-reduce:hidden"
          />
        </Link>
      </Hover>
    </li>
  );
};

export const ServiceCards = ({ eyebrow, heading, lead, cta, items }: ServiceCardsProps) => (
  <Section labelledBy={HEADING_ID} className="border-y border-line">
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
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.slug} item={item} />
        ))}
      </ul>
    </Container>
  </Section>
);
