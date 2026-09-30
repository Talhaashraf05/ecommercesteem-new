// "How we hire": numbered steps joined by a connecting line (vertical on mobile,
// horizontal on desktop). Server component; RevealGrid is the only client island.
import type { HiringStep } from "@/content/schemas";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import { RevealGrid } from "@/components/ui/reveal-grid";
import { Section } from "@/components/ui/section";

const HEADING_ID = "hiring-title";
const pad = (n: number) => String(n).padStart(2, "0");

export interface HiringStepsProps {
  steps: HiringStep[];
  heading: string;
  lead?: string;
}

export const HiringSteps = ({ steps, heading, lead }: HiringStepsProps) => (
  <Section labelledBy={HEADING_ID}>
    <Container>
      <AnimatedHeading
        as="h2"
        id={HEADING_ID}
        className="font-display text-display-sm font-semibold leading-title tracking-title text-fg"
      >
        {heading}
      </AnimatedHeading>
      {lead && <p className="mt-6 max-w-lead text-lead text-muted">{lead}</p>}
      <div className="relative mt-14">
        {/* Connecting line through the badge centres (size-14 badges; on desktop it stops at
            the last badge: one column, 25% less its share of the three gap-8 gaps, less 1.75rem). */}
        <span
          aria-hidden="true"
          className="absolute bottom-7 left-7 top-7 w-px bg-linear-to-b from-brand via-line-strong to-line lg:bottom-auto lg:right-[calc(25%-3.25rem)] lg:h-px lg:w-auto lg:bg-linear-to-r"
        />
        <RevealGrid as="ol" itemAs="li" className="relative grid gap-10 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-6 lg:flex-col">
              <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-raised font-display text-lead font-semibold tabular-nums text-fg">
                <span
                  aria-hidden="true"
                  className="absolute inset-1 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_75%)] opacity-40"
                />
                <span className="relative">{pad(i + 1)}</span>
              </span>
              <div className="pt-3 lg:pt-0">
                <h3 className="font-display text-h3 font-semibold leading-title tracking-title text-fg">{step.title}</h3>
                <p className="mt-3 max-w-xs text-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </RevealGrid>
      </div>
    </Container>
  </Section>
);
