"use client";

// Stats bento — ported from Stride's stats section, restyled for the dark system: a
// photo collaboration card, a raised commitment/quote card, and a right column with a
// brand-red data card over a bordered reach card. Cards do a soft staggered reveal
// (opacity + blur + slight rise) on scroll, driven by the shared ticker via
// useRevealCascade (ADR-0015). Reduced motion: the cascade jumps straight to revealed.
import Image from "next/image";
import { animated } from "@react-spring/web";
import { useRevealCascade } from "@/components/common/use-reveal-cascade";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Section } from "@/components/ui/section";

export interface StatsBentoContent {
  heading: string;
  lead: string;
  photo: { src: string; alt: string };
  collab: { value: string; desc: string };
  commitment: { eyebrow: string; value: string; quote: string; author: string; initials: string[] };
  data: { label: string; value: string; desc: string };
  reach: { label: string; value: string };
}

export interface StatsBentoProps {
  content: StatsBentoContent;
}

const CARD_RISE = 24; // px cards rise from
const CARD_BLUR = 12; // px soft start blur
const HEADING_ID = "stats-bento-title";

const BarsIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
    <rect x="4" y="12" width="4" height="8" rx="1" />
    <rect x="10" y="7" width="4" height="13" rx="1" />
    <rect x="16" y="3" width="4" height="17" rx="1" />
  </svg>
);

const STAT_NUM =
  "font-display font-semibold leading-none tracking-tight text-[2rem] sm:text-[2.5rem] lg:text-[4rem]";

export const StatsBento = ({ content }: StatsBentoProps) => {
  const { heading, lead, photo, collab, commitment, data, reach } = content;
  const { p, rootRef, localProg } = useRevealCascade<HTMLDivElement>(4);
  const cardStyle = (i: number) => ({
    opacity: p.to((v) => localProg(v, i)),
    transform: p.to((v) => `translateY(${CARD_RISE * (1 - localProg(v, i))}px)`),
    filter: p.to((v) => `blur(${CARD_BLUR * (1 - localProg(v, i))}px)`),
  });
  return (
    <Section labelledBy={HEADING_ID}>
      <div className="mb-16">
        <AnimatedHeading
          as="h2"
          id={HEADING_ID}
          className="mb-6 font-display text-display-sm font-semibold leading-title tracking-title"
        >
          {heading}
        </AnimatedHeading>
        <p className="max-w-lead text-lead text-muted">{lead}</p>
      </div>

      <div ref={rootRef} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Collaboration — photo card */}
        <animated.article
          style={cardStyle(0)}
          className="relative flex min-h-[32rem] flex-col justify-end overflow-hidden rounded-3xl bg-surface p-7 text-fg [will-change:transform,opacity]"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/10 to-bg/80"
            aria-hidden="true"
          />
          <span className="absolute left-7 top-7 text-eyebrow font-medium tracking-wide text-fg">
            EcommerceSteem
          </span>
          <span className="absolute right-7 top-7 flex size-11 items-center justify-center rounded-xl bg-brand text-fg">
            <BarsIcon />
          </span>
          <div className="relative rounded-2xl bg-bg/80 p-6 text-fg backdrop-blur">
            <div className={STAT_NUM}>{collab.value}</div>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-muted">{collab.desc}</p>
          </div>
        </animated.article>

        {/* Commitment — raised card with quote */}
        <animated.article
          style={cardStyle(1)}
          className="flex min-h-[32rem] flex-col rounded-3xl bg-surface-raised p-8 text-fg [will-change:transform,opacity]"
        >
          <p className="text-base leading-relaxed text-muted">{commitment.eyebrow}</p>
          <div className={`mt-4 ${STAT_NUM}`}>{commitment.value}</div>
          <figure className="mt-auto">
            <div className="mb-6 flex" aria-hidden="true">
              {commitment.initials.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="-ml-3 flex size-11 items-center justify-center rounded-full border-2 border-surface-raised bg-brand/20 text-sm font-semibold text-fg first:ml-0"
                >
                  {t}
                </span>
              ))}
            </div>
            <blockquote className="max-w-md text-2xl leading-snug tracking-tight text-fg/90">
              &ldquo;{commitment.quote}&rdquo;
            </blockquote>
            <figcaption>
              <cite className="mt-3 block text-sm not-italic text-muted">— {commitment.author}</cite>
            </figcaption>
          </figure>
        </animated.article>

        {/* Right column — brand data card over a bordered reach card */}
        <div className="flex flex-col gap-6">
          <animated.article
            style={cardStyle(2)}
            className="flex flex-1 flex-col rounded-3xl bg-brand p-8 text-fg [will-change:transform,opacity]"
          >
            <p className="text-sm text-fg/80">{data.label}</p>
            <div className={`mt-4 ${STAT_NUM}`}>{data.value}</div>
            <p className="mt-auto max-w-xs pt-8 text-base leading-relaxed text-fg/80">{data.desc}</p>
          </animated.article>
          <animated.article
            style={cardStyle(3)}
            className="flex items-center justify-between gap-4 rounded-3xl border border-line bg-surface px-8 py-10 text-fg [will-change:transform,opacity]"
          >
            <span className="text-lg text-muted">{reach.label}</span>
            <span className={STAT_NUM}>{reach.value}</span>
          </animated.article>
        </div>
      </div>
    </Section>
  );
};
