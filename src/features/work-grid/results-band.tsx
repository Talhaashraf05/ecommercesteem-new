// "Results in numbers" band on /work: four headline figures that count up on scroll-in.
// Server component; CountUp and RevealGrid are the client islands.
import { Fragment } from "react";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { RevealGrid } from "@/components/ui/reveal-grid";
import { Section } from "@/components/ui/section";

const HEADING_ID = "results-title";

export interface ResultsBandProps {
  eyebrow: string;
  heading: string;
  items: { value: string; label: string }[];
}

export const ResultsBand = ({ eyebrow, heading, items }: ResultsBandProps) => (
  <Section labelledBy={HEADING_ID}>
    <Container>
      <div className="relative isolate overflow-clip rounded-[2rem] border border-line bg-surface-glass p-8 backdrop-blur-md md:p-12">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-48 -z-10 size-128 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_70%)] opacity-15"
        />
        <p className="text-kicker uppercase tracking-widest text-brand-glow">{eyebrow}</p>
        <AnimatedHeading
          as="h2"
          id={HEADING_ID}
          className="mt-3 font-display text-display-sm font-semibold leading-title tracking-title text-fg"
        >
          {heading}
        </AnimatedHeading>
        {/* Each wrapper div is the dt/dd group, so the dl stays valid. */}
        <RevealGrid
          as="dl"
          className="mt-12 grid grid-cols-2 gap-px overflow-clip rounded-3xl border border-line bg-line lg:grid-cols-4"
          itemClassName="flex flex-col-reverse justify-end gap-3 bg-bg p-6 md:p-8"
        >
          {items.map((item) => (
            <Fragment key={item.label}>
              <dt className="text-kicker text-muted md:text-lead">{item.label}</dt>
              <dd className="font-display text-stat font-semibold leading-none tracking-title text-fg">
                <CountUp value={item.value} />
              </dd>
            </Fragment>
          ))}
        </RevealGrid>
      </div>
    </Container>
  </Section>
);
