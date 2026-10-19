import Link from "next/link";
import { caseStudies, caseStudyPage as copy, getService } from "@/content";
import type { CaseStudy } from "@/content/schemas";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Section } from "@/components/ui/section";
import { NextCase } from "@/features/case-study/next-case";
import { ParallaxHero } from "@/features/case-study/parallax-hero";
import { StoryScroll } from "@/features/case-study/story-scroll";
import { CtaBand } from "@/features/cta/cta-band";

const KICKER = "text-kicker uppercase tracking-widest text-brand-glow";

export const CaseStudyView = ({ study }: { study: CaseStudy }) => {
  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];
  return (
    <main id="main">
      <ParallaxHero
        image={study.hoverImage ?? study.image}
        alt={`${study.client} case study results`}
        eyebrow={`${study.category} · ${study.year}`}
        title={study.client}
        metric={study.headlineMetric}
      />

      <Section labelledBy="metrics-title" className="!pb-0 !pt-8 md:!pt-12">
        <Container>
          <h2 id="metrics-title" className={KICKER}>
            {copy.metricsHeading}
          </h2>
          <dl className="mt-8 grid gap-px overflow-clip rounded-3xl border border-line bg-line md:grid-cols-3">
            {study.metrics.map((m) => (
              <div key={m.label} className="flex flex-col-reverse justify-end gap-3 bg-bg p-8 md:p-10">
                <dt className="text-lead text-muted">{m.label}</dt>
                <dd className="font-display text-stat font-semibold leading-none tracking-title text-fg">
                  <CountUp value={m.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section label={copy.storyLabel.replace("{client}", study.client)}>
        <Container>
          <StoryScroll
            blocks={[
              { label: copy.story.challenge, kind: "text", text: study.challenge },
              { label: copy.story.approach, kind: "steps", steps: study.approach },
              { label: copy.story.outcome, kind: "text", text: study.outcome },
            ]}
          />
        </Container>
      </Section>

      <Section labelledBy="services-title" className="!pt-0 !pb-16 md:!pb-20">
        <Container>
          <div className="flex flex-col gap-6 border-t border-line pt-16 md:flex-row md:items-center md:justify-between md:pt-20">
            <h2 id="services-title" className={KICKER}>
              {copy.services}
            </h2>
            <ul className="flex flex-wrap gap-3">
              {study.services.map((s) => (
                <li key={s}>
                  <Link
                    href={`/services/${s}`}
                    className="inline-block rounded-full border border-line-strong bg-surface-glass px-5 py-2.5 text-fg transition-colors duration-200 hover:border-fg/60 hover:bg-surface-glass-hover"
                  >
                    {getService(s)?.name ?? s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {next.slug !== study.slug && (
        <NextCase
          slug={next.slug}
          client={next.client}
          metric={next.headlineMetric}
          image={next.hoverImage ?? next.image}
          label={copy.next}
        />
      )}

      <CtaBand title={copy.cta.title} body={copy.cta.body} primary={copy.cta.primary} secondary={copy.cta.secondary} />
    </main>
  );
};
