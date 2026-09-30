import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import type { ProcessStep } from "@/content/schemas";

export const ProcessSteps = ({ steps }: { steps: ProcessStep[] }) => (
  <Container>
    <AnimatedHeading id="process-title" as="h2" className="font-display text-display-sm text-fg">
      How we work
    </AnimatedHeading>
    <p className="mt-6 max-w-lead text-lead text-muted">
      A hands-off approach: we audit, plan, create and manage — you watch the numbers.
    </p>
    <ol className="mt-16 grid border-y border-line md:grid-cols-5 md:divide-x md:divide-line max-md:divide-y max-md:divide-line">
      {steps.map((s) => (
        <li key={s.number} className="p-8">
          <span className="font-display text-stat text-brand">{s.number}</span>
          <h3 className="mt-4 font-display text-h3 text-fg">{s.title}</h3>
          <p className="mt-3 text-muted">{s.description}</p>
        </li>
      ))}
    </ol>
  </Container>
);
