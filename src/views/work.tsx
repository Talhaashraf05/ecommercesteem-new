import { caseStudies, getService, stats, workPage as copy } from "@/content";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";
import { PortfolioStack } from "@/features/portfolio-stack/portfolio-stack";
import { ResultsBand } from "@/features/work-grid/results-band";
import { WorkGrid } from "@/features/work-grid/work-grid";

const highlight = caseStudies.find((c) => c.slug === copy.results.highlightSlug);

const results = [
  ...stats.slice(0, 3).map((s) => ({ value: s.value, label: s.label })),
  ...(highlight ? [{ value: highlight.headlineMetric.value, label: highlight.headlineMetric.label }] : []),
];

export const WorkView = () => (
  <main id="main">
    <PortfolioStack
      headingAs="h1"
      heading={copy.stack.heading}
      priority
      items={caseStudies.map((c) => ({
        slug: c.slug,
        client: c.client,
        headline: `${c.headlineMetric.value} ${c.headlineMetric.label}`,
        image: c.image,
      }))}
    />

    <ResultsBand eyebrow={copy.results.eyebrow} heading={copy.results.heading} items={results} />

    <Section id="all" labelledBy="all-title" className="scroll-mt-18">
      <Container>
        <AnimatedHeading
          as="h2"
          id="all-title"
          className="font-display text-display-sm font-semibold leading-title tracking-title text-fg"
        >
          {copy.grid.heading}
        </AnimatedHeading>
        <p className="mt-6 max-w-lead text-lead text-muted">{copy.grid.lead}</p>
        <div className="mt-12">
          <WorkGrid
            copy={{
              filterLabel: copy.grid.filterLabel,
              count: copy.grid.count,
              countOne: copy.grid.countOne,
              empty: copy.grid.empty,
            }}
            items={caseStudies.map((c) => ({
              slug: c.slug,
              client: c.client,
              category: c.category,
              headline: c.headlineMetric,
              services: c.services,
              serviceNames: c.services.map((s) => getService(s)?.name ?? s),
              image: c.image,
            }))}
          />
        </div>
      </Container>
    </Section>

    <CtaBand title={copy.cta.title} body={copy.cta.body} primary={copy.cta.primary} secondary={copy.cta.secondary} />
  </main>
);
