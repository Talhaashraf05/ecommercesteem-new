import Link from "next/link";
import { activeJobs } from "@/content";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { CareersForm } from "@/features/careers-form/careers-form";

export const CareersView = () => (
  <main id="main">
    <PageHero
      eyebrow="Careers"
      title="Help ambitious brands grow"
      lead="Come help us build the complete e-commerce growth solution for ambitious brands."
    />
    <Section labelledBy="roles-title" className="!pt-0">
      <Container>
        {activeJobs.length > 0 ? (
          <>
            <h2 id="roles-title" className="font-display text-display-sm text-fg">Open roles</h2>
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {activeJobs.map((j) => (
                <li key={j.id}>
                  <Link
                    href={`/careers/${j.id}`}
                    className="flex h-full flex-col rounded-3xl border border-line bg-surface p-8 transition-colors duration-200 hover:border-line-strong"
                  >
                    <p className="text-kicker text-muted">{j.category}</p>
                    <h3 className="mt-2 font-display text-lead text-fg">{j.title}</h3>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {[j.location, j.type, j.mode, j.experience].map((t) => (
                        <li key={t} className="rounded-full border border-line px-3 py-1 text-kicker text-muted">{t}</li>
                      ))}
                    </ul>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 id="roles-title" className="font-display text-display-sm text-fg">No open roles right now</h2>
              <p className="mt-6 text-lead text-muted">
                We&apos;re always happy to meet great people. Send your CV and we&apos;ll keep it on file.
              </p>
            </div>
            <CareersForm position="General application" />
          </div>
        )}
      </Container>
    </Section>
  </main>
);
