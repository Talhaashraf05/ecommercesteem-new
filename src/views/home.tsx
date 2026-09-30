import { caseStudies, clients, homeFaq, pricing, processSteps, stats, testimonials } from "@/content";
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
import { ServiceColumns } from "@/features/service-columns/service-columns";
import { StatsBento } from "@/features/stats-bento/stats-bento";

const copy = {
  hero: {
    eyebrow: "E-commerce growth agency",
    title: "Build. Grow. Scale.",
    subtitle: "We run Amazon, Meta and Google for e-commerce brands — as one growth engine.",
  },
  cards: stats.map((s) => ({ id: s.id, title: s.label, stat: s.value, description: s.description })),
  wave: {
    eyebrow: "One growth engine",
    title: "Amazon, Meta & Google — run as one",
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
        collab: { value: stats[0].value, desc: "brands trust us with their Amazon, Meta and Google growth." },
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
    <ServiceColumns
      heading="What we run"
      cta={{ label: "All services", href: "/services" }}
      items={[
        { prefix: "Amazon", name: "Marketplace", image: "/images/amazon-1.webp", href: "/services/amazon-account-management" },
        { prefix: "Meta", name: "Ads", image: "/images/meta-ads.webp", href: "/services/meta-ads" },
        { prefix: "Google", name: "Ads", image: "/images/google-ads.webp", href: "/services/google-ads" },
        { prefix: "Retention", name: "& SEO", image: "/images/email-marketing.webp", href: "/services/email-marketing" },
      ]}
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
    <Section id="process" labelledBy="process-title">
      <ProcessSteps steps={processSteps} />
    </Section>
    <Section id="pricing" labelledBy="pricing-title" tone="raised">
      <Container>
        <AnimatedHeading id="pricing-title" as="h2" className="font-display text-display-sm text-fg">
          Simple, transparent pricing
        </AnimatedHeading>
        <div className="mt-12">
          <PricingTabs groups={pricing} />
        </div>
      </Container>
    </Section>
    <Section labelledBy="testimonials-title">
      <Testimonials items={testimonials} />
    </Section>
    <Section id="faq" labelledBy="faq-title">
      <Container width="title">
        <AnimatedHeading id="faq-title" as="h2" className="font-display text-display-sm text-fg">
          Questions we get most
        </AnimatedHeading>
        <div className="mt-12">
          <FaqList items={homeFaq} />
        </div>
      </Container>
    </Section>
    <CtaBand
      title="Ready to grow?"
      body="Book a free audit of your Amazon, Meta or Google account. We'll show you where the money is leaking — and what we'd do about it."
      primary={{ label: "Book a free audit", href: "/contact" }}
      secondary={{ label: "See our work", href: "/work" }}
    />
  </main>
);
