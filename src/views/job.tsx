import Link from "next/link";
import { careersPage } from "@/content";
import type { Job } from "@/content/schemas";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { CareersForm } from "@/features/careers-form/careers-form";
import { CtaBand } from "@/features/cta/cta-band";

const copy = careersPage.job;
// The apply form is about 61rem tall at lg with every field error showing, so it only
// sticks on viewports tall enough to keep the submit button in view below top-28.
const STICKY_APPLY = "[@media(min-width:64rem)_and_(min-height:72rem)]:sticky [@media(min-width:64rem)_and_(min-height:72rem)]:top-28";
const H2 = "font-display text-h3 font-semibold leading-title tracking-title text-fg";

const List = ({ id, title, items }: { id: string; title: string; items: string[] }) => (
  <section aria-labelledby={id} className="border-t border-line pt-10">
    <h2 id={id} className={H2}>
      {title}
    </h2>
    <ul className="mt-6 grid gap-4">
      {items.map((i) => (
        <li key={i} className="flex gap-4 text-lead text-muted">
          <span
            aria-hidden="true"
            className="mt-2.5 size-2 shrink-0 rounded-full bg-brand shadow-[0_0_0.5rem_var(--brand-glow)]"
          />
          {i}
        </li>
      ))}
    </ul>
  </section>
);

export const JobView = ({ job }: { job: Job }) => (
  <main id="main">
    {/* Compact static hero: a faint brand/glow gradient stands in for the wave scene. */}
    <header className="relative isolate overflow-hidden px-gutter pb-16 pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_85%_0%,var(--brand)_0%,transparent_70%),radial-gradient(ellipse_40%_60%_at_60%_20%,var(--brand-glow)_0%,transparent_70%)] opacity-30"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-b from-transparent to-bg" />
      <Container>
        <Link href="/careers" className="text-sm text-muted transition-colors duration-200 hover:text-fg">
          ← {copy.backLabel}
        </Link>
        <div className="mt-8">
          <Eyebrow className="capitalize">{job.category}</Eyebrow>
        </div>
        <h1 className="mt-8 max-w-title font-display text-display font-semibold leading-title tracking-title text-fg">
          {job.title}
        </h1>
        <ul className="mt-8 flex flex-wrap gap-2">
          {[job.location, job.type, job.mode, job.experience].map((t) => (
            <li key={t} className="rounded-full border border-line-strong bg-surface-glass px-4 py-2 text-sm text-fg backdrop-blur-md">
              {t}
            </li>
          ))}
        </ul>
        {!job.active && (
          <p className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-line-strong bg-surface-glass px-4 py-2 text-sm text-muted backdrop-blur-md">
            <span aria-hidden="true" className="size-2 rounded-full bg-brand shadow-[0_0_0.5rem_var(--brand-glow)]" />
            <span className="text-fg">{copy.closedNotice}</span>
            <span aria-hidden="true">·</span>
            <Link href="/careers" className="underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-fg">
              {copy.closedCta}
            </Link>
          </p>
        )}
      </Container>
    </header>

    <Section labelledBy="job-overview" className="!pt-8">
      <Container className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="grid gap-10 lg:col-span-7">
          <section aria-labelledby="job-overview">
            <h2 id="job-overview" className={H2}>
              {copy.overviewHeading}
            </h2>
            <div className="mt-6 grid gap-4 text-lead text-muted">
              {job.overview.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
          <List id="job-do" title={copy.doHeading} items={job.whatYoullDo} />
          <List id="job-bring" title={copy.bringHeading} items={job.whatYoullBring} />
        </div>
        <aside aria-label={job.active ? copy.applyHeading : copy.closedHeading} className={`lg:col-span-5 ${STICKY_APPLY}`}>
          {job.active ? (
            <div id="apply" className="scroll-mt-28">
              <h2 className="sr-only">{copy.applyHeading}</h2>
              <CareersForm position={job.title} />
            </div>
          ) : (
            <div
              className="relative overflow-hidden rounded-3xl border border-line bg-surface-glass p-8 backdrop-blur-md sm:p-10"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_70%)] opacity-25"
              />
              <h2 className="relative font-display text-h3 font-semibold text-fg">{copy.closedHeading}</h2>
              <p className="relative mt-4 text-muted">{copy.closedBody}</p>
              <ButtonLink href="/careers" className="relative mt-8" withArrow>
                {copy.closedCta}
              </ButtonLink>
            </div>
          )}
        </aside>
      </Container>
    </Section>

    <CtaBand
      title={careersPage.cta.title}
      body={careersPage.cta.body}
      primary={careersPage.cta.primary}
      secondary={careersPage.cta.secondary}
    />
  </main>
);
