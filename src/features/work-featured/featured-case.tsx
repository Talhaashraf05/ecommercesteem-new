// Featured case study on /work: an editorial spread with the photo on one side and the
// story's headline numbers on the other (stacked on mobile). Server component; the
// photo's parallax and the CountUp are the client leaves.
import type { CaseStudy } from "@/content/schemas";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Section } from "@/components/ui/section";
import { FeaturedImage } from "./featured-image";

export interface FeaturedCaseCopy {
  eyebrow: string;
  challengeLabel: string;
  metricsLabel: string;
  cta: string;
}

const HEADING_ID = "featured-title";

export const FeaturedCase = ({ study, copy }: { study: CaseStudy; copy: FeaturedCaseCopy }) => (
  <Section labelledBy={HEADING_ID}>
    <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <FeaturedImage src={study.image} alt="" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-card p-7 shadow-card sm:p-9 lg:col-span-6 lg:col-start-7 lg:p-11">
        {/* Brand corner glow, echoing the cards elsewhere on the site. Decorative only. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_70%)] opacity-25"
        />
        {/* Hairline brand accent along the top edge. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand to-transparent" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-kicker uppercase tracking-widest">
            <span className="inline-flex items-center rounded-full border border-brand/40 bg-brand/10 px-3 py-1 font-semibold text-brand-glow">
              {copy.eyebrow}
            </span>
            <span className="text-muted">{study.category}</span>
            <span aria-hidden="true" className="text-muted">·</span>
            <span className="text-muted">{study.year}</span>
          </div>

          <h2 id={HEADING_ID} className="mt-5 font-display text-display-sm font-semibold leading-title tracking-title text-fg">
            {study.client}
          </h2>

          <p className="mt-8 flex flex-col gap-2">
            <span className="font-display text-stat font-semibold leading-none tracking-title text-brand">
              <CountUp value={study.headlineMetric.value} />
            </span>
            <span className="text-lead text-fg">{study.headlineMetric.label}</span>
          </p>

          <h3 className="mt-8 text-kicker uppercase tracking-widest text-muted">{copy.challengeLabel}</h3>
          <p className="mt-3 max-w-lead text-lead text-muted">{study.challenge}</p>

          <h3 className="sr-only">{copy.metricsLabel}</h3>
          <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-line pt-6">
            {study.metrics.map((m) => (
              <div key={m.label} className="flex flex-col-reverse justify-end gap-1">
                <dt className="text-sm text-muted">{m.label}</dt>
                <dd className="font-display text-h3 font-semibold leading-title tracking-title text-fg">{m.value}</dd>
              </div>
            ))}
          </dl>

          <ButtonLink href={`/work/${study.slug}`} size="lg" withArrow className="mt-9">
            {copy.cta}
          </ButtonLink>
        </div>
      </div>
    </Container>
  </Section>
);
