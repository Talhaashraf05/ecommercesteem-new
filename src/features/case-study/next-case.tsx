"use client";

// Full-width "next case study" card at the foot of a case study. On lg, hovering the
// card reveals the next study's photo bottom-to-top through a clip-path spring (<Hover>,
// as in ServiceColumns) and the arrow disc turns brand red. Touch widths and reduced
// motion show the photo statically under a scrim; keyboard focus shows it too.
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Hover } from "@/components/animation/springs/hover";
import { ArrowIcon } from "@/components/ui/icons";

export interface NextCaseProps {
  slug: string;
  client: string;
  metric: { value: string; label: string };
  image: string;
  /** Kicker above the client name, e.g. "Next case study". */
  label: string;
}

const REVEAL_CONFIG = { tension: 170, friction: 26 };

export const NextCase = ({ slug, client, metric, image, label }: NextCaseProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <section aria-label={label} className="border-y border-line">
      <Link
        ref={ref}
        href={`/work/${slug}`}
        className="group relative isolate flex h-[50vh] min-h-[22rem] items-end overflow-hidden bg-surface px-gutter pb-12 focus-visible:-outline-offset-4 md:pb-16"
      >
        {/* Touch widths, reduced motion and keyboard focus: the photo is always there. */}
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover lg:hidden lg:group-focus-visible:block lg:motion-reduce:block!"
        />
        {/* lg+: revealed bottom-to-top on hover. */}
        <Hover
          trigger={ref}
          tag="div"
          aria-hidden="true"
          className="absolute inset-0 -z-20 hidden will-change-[clip-path] lg:block motion-reduce:hidden!"
          from={{ clipPath: "inset(100% 0% 0% 0%)" }}
          to={{ clipPath: "inset(0% 0% 0% 0%)" }}
          config={REVEAL_CONFIG}
        >
          <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
        </Hover>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/60 to-bg/10"
        />

        <div className="mx-auto flex w-full max-w-page items-end justify-between gap-8">
          <div className="flex min-w-0 flex-col gap-4">
            <span className="text-kicker uppercase tracking-widest text-fg">{label}</span>
            <span className="font-display text-display font-semibold leading-title tracking-title text-fg">
              {client}
            </span>
            <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-display text-h3 font-semibold text-brand-glow">{metric.value}</span>
              <span className="text-lead text-fg">{metric.label}</span>
            </span>
          </div>
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full border border-line-strong bg-bg/60 text-fg backdrop-blur transition-colors duration-300 group-hover:border-brand-strong group-hover:bg-brand-strong group-focus-visible:border-brand-strong group-focus-visible:bg-brand-strong md:size-20"
          >
            <ArrowIcon className="size-5 md:size-6" />
          </span>
        </div>
      </Link>
    </section>
  );
};
