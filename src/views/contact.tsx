import { Suspense } from "react";
import { clients, contactPage as copy, homeFaq, officeMarkers, offices, services, site } from "@/content";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { CinematicHero } from "@/components/ui/cinematic-hero";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ContactForm, ContactFormFromParams } from "@/features/contact-form/contact-form";
import { NextSteps } from "@/features/contact/next-steps";
import { CtaBand } from "@/features/cta/cta-band";
import { FaqList } from "@/features/faq/faq-list";
import { HeroScene } from "@/features/hero-scene/hero-scene";
import { LogoMarquee } from "@/features/logo-marquee/logo-marquee";
import { OfficeMap } from "@/features/office-map/office-map";

const serviceOptions = services.map((s) => ({ value: s.slug, label: s.name }));
const LINK = "text-fg transition-colors duration-200 hover:text-brand-glow";
const CARD = "rounded-3xl border border-line bg-surface-glass p-6 backdrop-blur-md md:p-8";
const H2 = "font-display text-display-sm font-semibold leading-title tracking-title text-fg";
// Stick the form beside the aside only when the whole card (with validation errors,
// about 51rem at lg) fits below the top-28 offset; shorter viewports scroll it normally
// so the submit button is always reachable.
const STICKY_FORM = "[@media(min-width:64rem)_and_(min-height:60rem)]:sticky [@media(min-width:64rem)_and_(min-height:60rem)]:top-28";
const H3 = "font-display text-h3 font-semibold leading-title tracking-title text-fg";

/** "Reply within 1 business day": an Eyebrow-style pill with a glowing brand dot. */
const ReplyBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-3 rounded-full border border-line-strong bg-surface-glass px-5 py-2.5 text-eyebrow font-medium text-fg shadow-card backdrop-blur-md">
    <span aria-hidden="true" className="size-2 rounded-full bg-brand shadow-[0_0_0.75rem_var(--brand-glow)]" />
    {children}
  </span>
);

export const ContactView = () => (
  <main id="main">
    <CinematicHero
      size="tall"
      eyebrow={copy.hero.eyebrow}
      title={copy.hero.title}
      lead={copy.hero.lead}
      scene={<HeroScene shape="sphere" interactive />}
      actions={<ReplyBadge>{copy.hero.badge}</ReplyBadge>}
    />

    {/* Pulled up into the hero's bottom glow; z-10 keeps it above the hero's layers. */}
    <div className="relative z-10 -mt-24 px-gutter">
      <Container className="grid items-start gap-8 lg:grid-cols-[3fr_2fr] lg:gap-10">
        <section
          aria-labelledby="contact-form-title"
          className={`relative isolate overflow-clip rounded-[2rem] border border-line bg-surface/80 p-6 shadow-card backdrop-blur-xl md:p-10 ${STICKY_FORM}`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 -z-10 size-128 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_70%)] opacity-15"
          />
          <h2 id="contact-form-title" className={H3}>
            {copy.form.heading}
          </h2>
          <p className="mt-3 text-muted">{copy.form.lead}</p>
          <div className="mt-8">
            <Suspense fallback={<ContactForm serviceOptions={serviceOptions} />}>
              <ContactFormFromParams serviceOptions={serviceOptions} />
            </Suspense>
          </div>
        </section>

        <aside aria-label="How we work with you" className="grid gap-6">
          <div className={CARD}>
            <NextSteps heading={copy.nextSteps.heading} steps={copy.nextSteps.steps} />
          </div>

          <section aria-labelledby="contact-direct-title" className={CARD}>
            <h2 id="contact-direct-title" className={H3}>
              {copy.direct.heading}
            </h2>
            <dl className="mt-6 grid gap-5">
              <div>
                <dt className="text-kicker text-muted">{copy.direct.emailLabel}</dt>
                <dd className="mt-1">
                  <a href={`mailto:${site.email}`} className={LINK}>
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-kicker text-muted">{copy.direct.phoneLabel}</dt>
                <dd className="mt-1">
                  <a href={site.phoneHref} className={LINK}>
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-kicker text-muted">{copy.direct.hoursLabel}</dt>
                <dd className="mt-1 text-fg">{site.hours}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="contact-offices-title" className={CARD}>
            <h2 id="contact-offices-title" className={H3}>
              {copy.offices.heading}
            </h2>
            <OfficeMap
              className="mt-6 w-full"
              markers={offices.flatMap((o) => (officeMarkers[o.countryCode] ? [officeMarkers[o.countryCode]] : []))}
            />
            <ul className="mt-6 grid gap-4">
              {offices.map((o) => (
                <li key={o.countryCode} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-2 shrink-0 rounded-full bg-brand shadow-[0_0_0.5rem_var(--brand-glow)]"
                  />
                  <div>
                    <p className="text-fg">
                      {officeMarkers[o.countryCode]?.label ?? o.country}
                      <span className="text-muted">, {o.country}</span>
                    </p>
                    <address className="mt-1 text-sm not-italic text-muted">{o.address}</address>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </Container>
    </div>

    <div className="mt-24 md:mt-32">
      <p className="px-gutter pb-8 text-center text-lead text-fg">
        {copy.trust.line}
      </p>
      <LogoMarquee clients={clients} label={copy.trust.label} />
    </div>

    <Section labelledBy="contact-faq-title">
      <Container width="title">
        <AnimatedHeading as="h2" id="contact-faq-title" className={H2}>
          {copy.faq.heading}
        </AnimatedHeading>
        <div className="mt-12">
          <FaqList items={homeFaq.slice(0, 4)} />
        </div>
      </Container>
    </Section>

    <CtaBand title={copy.cta.title} body={copy.cta.body} primary={copy.cta.primary} secondary={copy.cta.secondary} />
  </main>
);
