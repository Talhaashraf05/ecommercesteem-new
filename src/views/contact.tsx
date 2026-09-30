import { Suspense } from "react";
import { offices, site } from "@/content";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/features/contact-form/contact-form";

const LINK = "text-fg transition-colors duration-200 hover:text-brand-glow";

export const ContactView = () => (
  <main id="main">
    <PageHero
      eyebrow="Contact"
      title="Let's grow your brand"
      lead="Tell us about your store and goals. We reply within one business day."
    />
    <Section labelledBy="contact-form-title" className="!pt-0">
      <Container className="grid items-start gap-12 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 id="contact-form-title" className="sr-only">Send us a message</h2>
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
        <aside aria-labelledby="contact-info-title" className="rounded-3xl border border-line bg-surface p-8 sm:p-10">
          <h2 id="contact-info-title" className="font-display text-lead text-fg">Contact details</h2>
          <dl className="mt-6 grid gap-5">
            <div>
              <dt className="text-kicker text-muted">Email</dt>
              <dd className="mt-1"><a href={`mailto:${site.email}`} className={LINK}>{site.email}</a></dd>
            </div>
            <div>
              <dt className="text-kicker text-muted">Phone</dt>
              <dd className="mt-1"><a href={site.phoneHref} className={LINK}>{site.phone}</a></dd>
            </div>
            <div>
              <dt className="text-kicker text-muted">Hours</dt>
              <dd className="mt-1 text-fg">{site.hours}</dd>
            </div>
            <div>
              <dt className="text-kicker text-muted">LinkedIn</dt>
              <dd className="mt-1">
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className={LINK}>EcommerceSteem on LinkedIn</a>
              </dd>
            </div>
          </dl>
          <ul className="mt-8 grid gap-5 border-t border-line pt-8">
            {offices.map((o) => (
              <li key={o.countryCode}>
                <h3 className="text-fg">{o.country}</h3>
                <address className="mt-1 text-sm not-italic text-muted">{o.address}</address>
              </li>
            ))}
          </ul>
        </aside>
      </Container>
    </Section>
  </main>
);
