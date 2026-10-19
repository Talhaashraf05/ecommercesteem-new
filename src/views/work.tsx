import { caseStudies, getService, stats, workPage as copy } from "@/content";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { CinematicHero } from "@/components/ui/cinematic-hero";
import { Container } from "@/components/ui/container";
import { GlassButton } from "@/components/ui/glass-button";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";
import { HeroScene } from "@/features/hero-scene/hero-scene";
import { FeaturedCase } from "@/features/work-featured/featured-case";
import { WorkIndex } from "@/features/work-index/work-index";

const heroStats = copy.hero.statIds.flatMap((id) => {
  const s = stats.find((x) => x.id === id);
  return s ? [{ value: s.value, label: s.label }] : [];
});

const featured = caseStudies.find((c) => c.slug === copy.featured.slug);

export const WorkView = () => (
  <main id="main">
    <CinematicHero
      size="full"
      eyebrow={copy.hero.eyebrow}
      title={copy.hero.title}
      lead={copy.hero.lead}
      scene={<HeroScene shape="chart" />}
      stats={heroStats}
      actions={
        <>
          <GlassButton href={copy.hero.primary.href} withArrow>
            {copy.hero.primary.label}
          </GlassButton>
          <GlassButton href={copy.hero.secondary.href} variant="secondary">
            {copy.hero.secondary.label}
          </GlassButton>
        </>
      }
    />

    {featured && <FeaturedCase study={{ ...featured, image: featured.workImage ?? featured.image }} copy={copy.featured} />}

    <Section id="index" labelledBy="index-title" className="scroll-mt-18">
      <Container>
        <AnimatedHeading
          as="h2"
          id="index-title"
          className="font-display text-display-sm font-semibold leading-title tracking-title text-fg"
        >
          {copy.index.heading}
        </AnimatedHeading>
        <div className="mt-10">
          <WorkIndex
            copy={{
              columns: copy.index.columns,
              filterLabel: copy.index.filterLabel,
              count: copy.index.count,
              countOne: copy.index.countOne,
              empty: copy.index.empty,
            }}
            items={caseStudies.map((c) => ({
              slug: c.slug,
              client: c.client,
              category: c.category,
              year: c.year,
              headline: c.headlineMetric,
              services: c.services,
              serviceNames: c.services.map((s) => getService(s)?.name ?? s),
              image: c.workImage ?? c.image,
              previewImage: c.hoverImage ?? c.workImage ?? c.image,
            }))}
          />
        </div>
      </Container>
    </Section>

    <CtaBand title={copy.cta.title} body={copy.cta.body} primary={copy.cta.primary} secondary={copy.cta.secondary} />
  </main>
);
