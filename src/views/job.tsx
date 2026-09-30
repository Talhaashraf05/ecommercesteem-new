import type { Job } from "@/content/schemas";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CareersForm } from "@/features/careers-form/careers-form";

const H2 = "font-display text-display-sm text-fg";

const List = ({ id, title, items }: { id: string; title: string; items: string[] }) => (
  <section aria-labelledby={id}>
    <h2 id={id} className="font-display text-lead text-fg">{title}</h2>
    <ul className="mt-4 grid list-disc gap-2 pl-5 text-muted">
      {items.map((i) => <li key={i}>{i}</li>)}
    </ul>
  </section>
);

export const JobView = ({ job }: { job: Job }) => (
  <main id="main">
    <PageHero eyebrow={job.category} title={job.title} lead={[job.location, job.type, job.mode, job.experience].join(" · ")} />
    <Section labelledBy="job-title" className="!pt-0">
      <Container className="grid items-start gap-12 lg:grid-cols-2">
        <div className="grid gap-10">
          <section aria-labelledby="job-title">
            <h2 id="job-title" className={H2}>Overview</h2>
            <div className="mt-6 grid gap-4 text-lead text-muted">
              {job.overview.map((p) => <p key={p}>{p}</p>)}
            </div>
          </section>
          <List id="job-do" title="What you'll do" items={job.whatYoullDo} />
          <List id="job-bring" title="What you'll bring" items={job.whatYoullBring} />
        </div>
        {job.active ? (
          <CareersForm position={job.title} />
        ) : (
          <div role="status" className="rounded-3xl border border-line bg-surface p-8 sm:p-10">
            <h2 className="font-display text-lead text-fg">This role is closed</h2>
            <p className="mt-4 text-muted">We&apos;re no longer accepting applications for this position.</p>
            <ButtonLink href="/careers" className="mt-8" withArrow>See all careers</ButtonLink>
          </div>
        )}
      </Container>
    </Section>
  </main>
);
