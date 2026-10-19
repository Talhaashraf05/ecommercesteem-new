import Image from "next/image";
import Link from "next/link";
import { caseStudies, getPricing, serviceGroups, SHOW_PRICING } from "@/content";
import type { Service } from "@/content/schemas";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";
import { FaqList } from "@/features/faq/faq-list";
import { PricingCard } from "@/features/pricing/pricing-card";

const H2 = "font-display text-display-sm font-semibold leading-title tracking-title text-fg";

export const ServiceView = ({ service }: { service: Service }) => {
  const groupLabel = serviceGroups.find((g) => g.id === service.group)?.label ?? "Services";
  const related = caseStudies.filter((c) => c.services.includes(service.slug));
  const pricing = getPricing(service.pricingGroup);
  const pdf = service.pdf ?? `/files/${service.pricingGroup}-pricing.pdf`;
  return (
    <main id="main">
      <PageHero
        eyebrow={groupLabel}
        title={service.name}
        lead={service.summary}
        actions={
          <>
            <ButtonLink href={`/contact?service=${service.slug}`} size="lg" withArrow>
              Book a free audit
            </ButtonLink>
            {SHOW_PRICING && (
              <ButtonLink href="#pricing" variant="secondary" size="lg">
                See pricing
              </ButtonLink>
            )}
          </>
        }
      />
      <Section label={`About ${service.name}`} className="!pt-0">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <p className="text-lead text-muted">{service.description}</p>
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-line">
            <Image
              src={service.image}
              alt={service.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Container>
      </Section>
      <Section labelledBy="included-title" tone="raised">
        <Container>
          <h2 id="included-title" className={H2}>What&apos;s included</h2>
          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {service.included.map((item) => (
              <li key={item} className="flex gap-3 rounded-2xl border border-line bg-surface-raised p-6 text-fg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand">
                  <path d="M5 12l5 5 9-10" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section labelledBy="how-title">
        <Container>
          <h2 id="how-title" className={H2}>How it works</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {service.steps.map((step, i) => (
              <li key={step.title} className="rounded-3xl border border-line bg-surface p-8">
                <span className="font-display text-stat text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-lead text-fg">{step.title}</h3>
                <p className="mt-3 text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      {related.length > 0 && (
        <Section labelledBy="related-title" tone="raised">
          <Container>
            <h2 id="related-title" className={H2}>Related work</h2>
            <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {related.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/work/${c.slug}`}
                    className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-colors duration-200 hover:border-line-strong"
                  >
                    <div className="relative aspect-[8/5] overflow-hidden">
                      <Image
                        src={c.image}
                        alt={c.client}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-8">
                      <p className="text-kicker text-muted">{c.category}</p>
                      <h3 className="mt-2 font-display text-lead text-fg">{c.client}</h3>
                      <p className="mt-4 text-fg">
                        <span className="font-display text-stat text-brand">{c.headlineMetric.value}</span>{" "}
                        <span className="text-muted">{c.headlineMetric.label}</span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
      {SHOW_PRICING && (
        <Section id="pricing" labelledBy="pricing-title">
          <Container>
            <h2 id="pricing-title" className={H2}>Pricing</h2>
            <p className="mt-6 max-w-lead text-lead text-muted">{pricing.intro}</p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {pricing.tiers.map((tier) => (
                <PricingCard key={tier.name} tier={tier} serviceSlug={service.slug} />
              ))}
            </div>
            <p className="mt-8 text-sm text-muted">Ad spend is billed directly by the platform and is not included.</p>
            <ButtonLink href={pdf} variant="ghost" external className="mt-4 text-sm">
              Download full pricing (PDF)
            </ButtonLink>
          </Container>
        </Section>
      )}
      <Section labelledBy="faq-title" tone="raised">
        <Container width="title">
          <h2 id="faq-title" className={H2}>Frequently asked questions</h2>
          <div className="mt-12">
            <FaqList items={service.faq} />
          </div>
        </Container>
      </Section>
      <CtaBand
        title={`Ready for ${service.shortName}?`}
        body="Book a free audit and we'll show you exactly where the opportunity is — and what we'd do about it."
        primary={{ label: "Book a free audit", href: `/contact?service=${service.slug}` }}
        secondary={{ label: "See our work", href: "/work" }}
      />
    </main>
  );
};
