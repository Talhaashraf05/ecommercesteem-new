import { caseStudies, clients, homeFaq, pricing, SHOW_PRICING, processSteps, services, stats, testimonials } from "@/content";
import { Container } from "@/components/ui/container";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/features/cta/cta-band";
import { FaqList } from "@/features/faq/faq-list";
import { PricingTabs } from "@/features/pricing/pricing-tabs";
import { ProcessSteps } from "@/features/process/process-steps";
import { Testimonials } from "@/features/testimonials/testimonials";
import { ExperienceSection } from "@/features/experience/experience-section";
import { LogoMarquee } from "@/features/logo-marquee/logo-marquee";
import { PortfolioStack } from "@/features/portfolio-stack/portfolio-stack";
import { ServiceCards } from "@/features/service-cards/service-cards";
import { StatsBento } from "@/features/stats-bento/stats-bento";

// The four services shown in "What we run" (Listings & A+ is covered under account management).
const RUN_SLUGS = ["amazon-account-management", "amazon-ppc", "email-marketing", "seo"] as const;

const copy = {
  hero: {
    eyebrow: "E-commerce growth agency",
    title: "Build. Grow. Scale.",
    subtitle: "We run Amazon, email and SEO for e-commerce brands — as one growth engine.",
  },
  logos: clients,
  wave: {
    eyebrow: "One growth engine",
    title: "Amazon, email & SEO — run as one",
    body: "Most brands run each channel in isolation. We connect marketplace, social and search so every dollar of spend lifts the others — with one team, one strategy and one report.",
  },
};

export const HomeView = () => (
  <main id="main">
    <ExperienceSection copy={copy} />
    <LogoMarquee clients={clients} label="Brands we've grown" />
    <StatsBento
      content={{
        heading: "Results that compound",
        lead: "We run the channels that move e-commerce revenue — and connect them so every dollar works harder.",
        photo: { src: "/images/team.webp", alt: "EcommerceSteem team at work" },
        collab: { value: stats[0].value, desc: "brands trust us with their Amazon growth." },
        commitment: {
          eyebrow: "Client rating",
          value: "5.0★",
          quote: testimonials[6].quote,
          author: testimonials[6].name,
          initials: ["BI", "AE", "MD", "MS"],
        },
        data: { label: "Projects delivered", value: stats[2].value, desc: "Launches, audits and campaigns shipped end to end." },
        reach: { label: "Countries served", value: stats[1].value },
      }}
    />
    <ServiceCards
      eyebrow="Services"
      heading="What we run"
      lead="Four ways we grow your brand, each run by specialists and reported in one place."
      core="One growth engine"
      cta={{ label: "All services", href: "/services" }}
      items={RUN_SLUGS.map((slug) => services.find((s) => s.slug === slug)!)}
    />
    <PortfolioStack
      heading="Selected work"
      items={caseStudies.map((c) => ({
        slug: c.slug,
        client: c.client,
        headline: `${c.headlineMetric.value} ${c.headlineMetric.label}`,
        image: c.image,
      }))}
    />
    <Section id="process" labelledBy="process-title" className="pb-8!">
      <ProcessSteps steps={processSteps} />
    </Section>
    {SHOW_PRICING && (
      <Section id="pricing" labelledBy="pricing-title" tone="raised">
        <Container>
          <AnimatedHeading id="pricing-title" as="h2" className="font-display text-display-sm font-semibold leading-title tracking-title text-fg">
            Simple, transparent pricing
          </AnimatedHeading>
          <div className="mt-12">
            <PricingTabs groups={pricing} />
          </div>
        </Container>
      </Section>
    )}
    <Testimonials items={testimonials} />
    <Section id="faq" labelledBy="faq-title">
      <Container width="title">
        <AnimatedHeading id="faq-title" as="h2" className="font-display text-display-sm font-semibold leading-title tracking-title text-fg">
          Questions we get most
        </AnimatedHeading>
        <div className="mt-12">
          <FaqList items={homeFaq} />
        </div>
      </Container>
    </Section>
    <CtaBand
      title="Ready to grow?"
      body="Book a free audit of your Amazon account. We'll show you where the money is leaking — and what we'd do about it."
      primary={{ label: "Book a free audit", href: "/contact" }}
      secondary={{ label: "See our work", href: "/work" }}
    />
  </main>
);
