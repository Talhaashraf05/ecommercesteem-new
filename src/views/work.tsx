import Image from "next/image";
import Link from "next/link";
import { caseStudies, getService } from "@/content";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";
import { PortfolioStack } from "@/features/portfolio-stack/portfolio-stack";

export const WorkView = () => (
  <main id="main">
    <PageHero eyebrow="Work" title="Brands we've helped grow" />
    <PortfolioStack
      heading="Selected work"
      priority
      items={caseStudies.map((c) => ({
        slug: c.slug,
        client: c.client,
        headline: `${c.headlineMetric.value} ${c.headlineMetric.label}`,
        image: c.image,
      }))}
    />
    <Section labelledBy="all-title">
      <Container>
        <h2 id="all-title" className="font-display text-display-sm text-fg">All case studies</h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {caseStudies.map((c) => (
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
                <div className="flex flex-1 flex-col p-8">
                  <p className="text-kicker text-muted">{c.category}</p>
                  <h3 className="mt-2 font-display text-lead text-fg">{c.client}</h3>
                  <p className="mt-4 text-fg">
                    <span className="font-display text-stat text-brand-glow">{c.headlineMetric.value}</span>{" "}
                    <span className="text-muted">{c.headlineMetric.label}</span>
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {c.services.map((s) => (
                      <li key={s} className="rounded-full border border-line px-3 py-1 text-kicker text-muted">
                        {getService(s)?.name ?? s}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
    <CtaBand
      title="Want results like these?"
      body="Book a free audit and we'll show you where your brand's next growth is hiding."
      primary={{ label: "Book a free audit", href: "/contact" }}
      secondary={{ label: "Explore services", href: "/services" }}
    />
  </main>
);
