import Image from "next/image";
import Link from "next/link";
import { caseStudies, getService } from "@/content";
import type { CaseStudy } from "@/content/schemas";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";

const H2 = "font-display text-display-sm text-fg";

export const CaseStudyView = ({ study }: { study: CaseStudy }) => {
  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];
  return (
    <main id="main">
      <PageHero
        eyebrow={`${study.category} · ${study.year}`}
        title={study.client}
        lead={`${study.headlineMetric.value} ${study.headlineMetric.label}`}
      />
      <Section label={`${study.client} overview`} className="!pt-0">
        <Container>
          <div className="relative aspect-[8/5] overflow-hidden rounded-3xl border border-line md:aspect-[2/1]">
            <Image
              src={study.image}
              alt={study.client}
              fill
              priority
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover"
            />
          </div>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {study.metrics.map((m) => (
              <li key={m.label} className="rounded-3xl border border-line bg-surface p-8">
                <p className="font-display text-stat text-brand-glow">{m.value}</p>
                <p className="mt-2 text-muted">{m.label}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section labelledBy="challenge-title" tone="raised">
        <Container width="title">
          <h2 id="challenge-title" className={H2}>The challenge</h2>
          <p className="mt-6 text-lead text-muted">{study.challenge}</p>
        </Container>
      </Section>
      <Section labelledBy="approach-title">
        <Container width="title">
          <h2 id="approach-title" className={H2}>What we did</h2>
          <ol className="mt-10 grid gap-4">
            {study.approach.map((step, i) => (
              <li key={step} className="flex gap-6 rounded-2xl border border-line bg-surface p-6">
                <span className="font-display text-stat text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-fg">{step}</span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <Section labelledBy="outcome-title" tone="raised">
        <Container width="title">
          <h2 id="outcome-title" className={H2}>The outcome</h2>
          <p className="mt-6 text-lead text-muted">{study.outcome}</p>
        </Container>
      </Section>
      <Section labelledBy="services-title">
        <Container>
          <h2 id="services-title" className={H2}>Services</h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {study.services.map((s) => (
              <li key={s}>
                <Link
                  href={`/services/${s}`}
                  className="inline-block rounded-full border border-line px-5 py-2 text-fg transition-colors duration-200 hover:border-line-strong"
                >
                  {getService(s)?.name ?? s}
                </Link>
              </li>
            ))}
          </ul>
          {next.slug !== study.slug && (
            <Link
              href={`/work/${next.slug}`}
              className="mt-16 flex flex-col gap-2 rounded-3xl border border-line bg-surface p-8 transition-colors duration-200 hover:border-line-strong"
            >
              <span className="text-kicker text-muted">Next case study</span>
              <span className="font-display text-lead text-fg">{next.client} →</span>
            </Link>
          )}
        </Container>
      </Section>
      <CtaBand
        title="Want results like these?"
        body="Book a free audit and we'll show you where your brand's next growth is hiding."
        primary={{ label: "Book a free audit", href: "/contact" }}
        secondary={{ label: "All case studies", href: "/work" }}
      />
    </main>
  );
};
