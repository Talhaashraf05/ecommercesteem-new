import { clients, officeMarkers as MARKERS, offices, site, stats, team, testimonials, timeline, values } from "@/content";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { CinematicHero } from "@/components/ui/cinematic-hero";
import { Container } from "@/components/ui/container";
import { GlassButton } from "@/components/ui/glass-button";
import { HoverRing } from "@/components/ui/hover-ring";
import { RevealGrid } from "@/components/ui/reveal-grid";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";
import { HeroScene } from "@/features/hero-scene/hero-scene";
import { LogoMarquee } from "@/features/logo-marquee/logo-marquee";
import { OfficeMap } from "@/features/office-map/office-map";
import { StatsBento } from "@/features/stats-bento/stats-bento";
import { Team } from "@/features/team/team";
import { Testimonials } from "@/features/testimonials/testimonials";
import { TimelineSection } from "@/features/timeline/timeline-section";
import { ValuesBento } from "@/features/values/values-bento";

const [brands, countries, projects] = stats;

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const AboutView = () => (
  <main id="main">
    <CinematicHero
      eyebrow="About"
      title="From vision to digital leadership"
      lead={site.about.story}
      scene={<HeroScene shape="helix" />}
      stats={stats.map((s) => ({ value: s.value, label: s.label }))}
      actions={
        <>
          <GlassButton href="/contact" withArrow>
            Book a free audit
          </GlassButton>
          <GlassButton href="/work" variant="secondary">
            See our work
          </GlassButton>
        </>
      }
    />

    <TimelineSection items={timeline} />

    <StatsBento
      content={{
        heading: site.about.missionTitle,
        lead: site.about.mission,
        photo: { src: "/images/team.webp", alt: "EcommerceSteem team at work" },
        collab: { value: brands.value, desc: "brands trust us with their Amazon, Meta and Google growth." },
        commitment: {
          eyebrow: "Client rating",
          value: "5.0★",
          quote: testimonials[6].quote,
          author: testimonials[6].name,
          initials: ["BI", "AE", "MD", "MS"],
        },
        data: { label: projects.label, value: projects.value, desc: projects.description },
        reach: { label: "Countries served", value: countries.value },
      }}
    />

    <ValuesBento values={values} />

    <Section labelledBy="offices-title">
      <Container>
        <AnimatedHeading
          as="h2"
          id="offices-title"
          className="font-display text-display-sm font-semibold leading-title tracking-title text-fg"
        >
          Where we work
        </AnimatedHeading>
        <p className="mt-6 max-w-lead text-lead text-muted">
          Three hubs across three continents, one team running your growth around the clock.
        </p>
        <OfficeMap
          className="mx-auto mt-12 max-w-5xl"
          markers={offices.flatMap((o) => (MARKERS[o.countryCode] ? [MARKERS[o.countryCode]] : []))}
        />
        <RevealGrid as="ul" itemAs="li" className="mt-12 grid gap-6 md:grid-cols-3">
          {offices.map((o) => (
            <HoverRing key={o.countryCode} className="h-full rounded-3xl">
              <article className="flex h-full flex-col rounded-3xl border border-line bg-surface-glass p-8 backdrop-blur-md">
                <p className="flex items-center gap-3 text-kicker text-muted">
                  <span aria-hidden="true" className="size-2 rounded-full bg-brand shadow-[0_0_0.5rem_var(--brand-glow)]" />
                  {MARKERS[o.countryCode]?.label ?? o.countryCode}
                </p>
                <h3 className="mt-4 font-display text-h3 font-semibold text-fg">{o.country}</h3>
                <address className="mt-3 not-italic text-muted">{o.address}</address>
                {o.phone && (
                  <p className="mt-auto pt-6">
                    <a
                      href={telHref(o.phone)}
                      className="text-fg transition-colors duration-200 hover:text-brand-glow"
                    >
                      {o.phone}
                    </a>
                  </p>
                )}
              </article>
            </HoverRing>
          ))}
        </RevealGrid>
        <p className="mt-10 text-muted">
          EcommerceSteem is part of {site.parentCompany.name}, {site.parentCompany.address}.
        </p>
      </Container>
    </Section>

    <LogoMarquee clients={clients} label="Brands we've grown" />
    <Testimonials items={testimonials} />
    <Team members={team} />
    <CtaBand
      title="Let's grow your brand"
      body="Book a free audit and we'll show you where your next stage of growth is hiding."
      primary={{ label: "Book a free audit", href: "/contact" }}
      secondary={{ label: "Explore services", href: "/services" }}
    />
  </main>
);
