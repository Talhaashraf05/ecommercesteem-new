import { activeJobs, careersPage as copy, hiringSteps, officeMarkers, offices, stats, values } from "@/content";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { CinematicHero } from "@/components/ui/cinematic-hero";
import { Container } from "@/components/ui/container";
import { GlassButton } from "@/components/ui/glass-button";
import { Section } from "@/components/ui/section";
import { CareersForm } from "@/features/careers-form/careers-form";
import { HiringSteps } from "@/features/careers/hiring-steps";
import { LifeBento } from "@/features/careers/life-bento";
import { RoleRowsLazy as RoleRows } from "@/features/careers/role-rows-lazy";
import { CtaBand } from "@/features/cta/cta-band";
import { HeroScene } from "@/features/hero-scene/hero-scene";

const H2 = "font-display text-display-sm font-semibold leading-title tracking-title text-fg";
const [brands, countries] = stats;

/** The glass card holding the general-application form; `#apply` targets the form. */
const ApplyCard = ({ id, heading, body }: { id: string; heading: string; body: string }) => (
  <div className="relative isolate grid items-start gap-12 overflow-clip rounded-[2rem] border border-line bg-surface/70 p-8 backdrop-blur-xl max-sm:p-4 max-sm:pt-8 md:p-12 lg:grid-cols-5">
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -left-40 -top-40 -z-10 size-128 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_70%)] opacity-20"
    />
    <div className="max-sm:px-4 lg:sticky lg:top-28 lg:col-span-2">
      <h2 id={id} className={H2}>
        {heading}
      </h2>
      <p className="mt-6 max-w-lead text-lead text-muted">{body}</p>
    </div>
    <div id="apply" className="scroll-mt-28 lg:col-span-3">
      <CareersForm position={copy.roles.generalPosition} />
    </div>
  </div>
);

export const CareersView = () => (
  <main id="main">
    <CinematicHero
      eyebrow={copy.hero.eyebrow}
      title={copy.hero.title}
      lead={copy.hero.lead}
      scene={<HeroScene shape="wave" />}
      actions={
        <>
          <GlassButton href="#roles" withArrow>
            {copy.hero.rolesCta}
          </GlassButton>
          <GlassButton href="#apply" variant="secondary">
            {copy.hero.applyCta}
          </GlassButton>
        </>
      }
    />

    <LifeBento
      values={values.slice(0, 3)}
      offices={offices}
      stats={[brands, countries]}
      markers={officeMarkers}
      copy={copy.life}
    />

    <Section id="roles" labelledBy="roles-title" className="scroll-mt-18">
      <Container>
        {activeJobs.length > 0 ? (
          <>
            <AnimatedHeading as="h2" id="roles-title" className={H2}>
              {copy.roles.heading}
            </AnimatedHeading>
            <p className="mt-6 max-w-lead text-lead text-muted">{copy.roles.lead}</p>
            <div className="mt-14">
              <RoleRows jobs={activeJobs} />
            </div>
            <div className="mt-16">
              <ApplyCard id="general-title" heading={copy.roles.generalHeading} body={copy.roles.generalBody} />
            </div>
          </>
        ) : (
          <ApplyCard id="roles-title" heading={copy.roles.emptyHeading} body={copy.roles.emptyBody} />
        )}
      </Container>
    </Section>

    <HiringSteps steps={hiringSteps} heading={copy.hiring.heading} lead={copy.hiring.lead} />

    <CtaBand title={copy.cta.title} body={copy.cta.body} primary={copy.cta.primary} secondary={copy.cta.secondary} />
  </main>
);
