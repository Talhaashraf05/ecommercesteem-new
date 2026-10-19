import Link from "next/link";
import { clients, serviceGroups, services } from "@/content";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";
import { LogoMarquee } from "@/features/logo-marquee/logo-marquee";

export const ServicesView = () => (
  <main id="main">
    <PageHero
      eyebrow="Services"
      title="Everything your e-commerce brand needs to grow"
      lead="Amazon at the core — with email and SEO to keep customers coming back."
    />
    {serviceGroups.map((group) => (
      <Section key={group.id} labelledBy={`group-${group.id}`} className="!py-12 md:!py-16">
        <Container>
          <h2 id={`group-${group.id}`} className="font-display text-display-sm text-fg">
            {group.label}
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services
              .filter((s) => s.group === group.id)
              .map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="flex h-full flex-col rounded-3xl border border-line bg-surface p-8 transition-colors duration-200 hover:border-line-strong"
                  >
                    <h3 className="font-display text-lead text-fg">{s.name}</h3>
                    <p className="mt-4 flex-1 text-muted">{s.summary}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {s.tags.map((t) => (
                        <li key={t} className="rounded-full border border-line px-3 py-1 text-kicker text-muted">
                          {t}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-8 text-sm font-medium text-fg">Learn more →</span>
                  </Link>
                </li>
              ))}
          </ul>
        </Container>
      </Section>
    ))}
    <div className="mt-24">
      <LogoMarquee clients={clients} label="Brands we've grown" />
    </div>
    <CtaBand
      title="Not sure where to start?"
      body="Book a free audit and we'll show you which channel will move your revenue fastest."
      primary={{ label: "Book a free audit", href: "/contact" }}
      secondary={{ label: "See our work", href: "/work" }}
    />
  </main>
);
