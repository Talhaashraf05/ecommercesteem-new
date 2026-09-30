import { clients, offices, site, stats, values } from "@/content";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";
import { LogoMarquee } from "@/features/logo-marquee/logo-marquee";

const H2 = "font-display text-display-sm text-fg";

export const AboutView = () => (
  <main id="main">
    <PageHero eyebrow="About" title="From vision to digital leadership" lead={site.about.story} />
    <Section labelledBy="mission-title" className="!pt-0">
      <Container className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <h2 id="mission-title" className={H2}>{site.about.missionTitle}</h2>
          <p className="mt-6 text-lead text-muted">{site.about.mission}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {stats.map((s) => (
            <li key={s.id} className="rounded-3xl border border-line bg-surface p-8">
              <p className="font-display text-stat text-fg">{s.value}</p>
              <p className="mt-2 text-kicker text-muted">{s.label}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
    <Section labelledBy="values-title" tone="raised">
      <Container>
        <h2 id="values-title" className={H2}>What we stand for</h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {values.map((v) => (
            <li key={v.title} className="rounded-3xl border border-line bg-surface-raised p-8">
              <h3 className="font-display text-lead text-fg">{v.title}</h3>
              <p className="mt-3 text-muted">{v.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
    <Section labelledBy="offices-title">
      <Container>
        <h2 id="offices-title" className={H2}>Where to find us</h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {offices.map((o) => (
            <li key={o.countryCode} className="rounded-3xl border border-line bg-surface p-8">
              <h3 className="font-display text-lead text-fg">{o.country}</h3>
              <address className="mt-3 not-italic text-muted">{o.address}</address>
              {o.phone && (
                <p className="mt-2">
                  <a
                    href={`tel:${o.phone.replace(/[^\d+]/g, "")}`}
                    className="text-fg transition-colors duration-200 hover:text-brand-glow"
                  >
                    {o.phone}
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-muted">
          EcommerceSteem is part of {site.parentCompany.name}, {site.parentCompany.address}.
        </p>
      </Container>
    </Section>
    <LogoMarquee clients={clients} label="Brands we've grown" />
    <CtaBand
      title="Let's grow your brand"
      body="Book a free audit and we'll show you where your next stage of growth is hiding."
      primary={{ label: "Book a free audit", href: "/contact" }}
      secondary={{ label: "Explore services", href: "/services" }}
    />
  </main>
);
