// "What happens next" on /contact: three numbered steps joined by a vertical
// connecting line. Server component; RevealGrid is the only client island.
import { RevealGrid } from "@/components/ui/reveal-grid";

export interface NextStep {
  title: string;
  detail?: string;
}

export interface NextStepsProps {
  heading: string;
  steps: NextStep[];
  headingId?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const NextSteps = ({ heading, steps, headingId = "next-steps-title" }: NextStepsProps) => (
  <div>
    <h2 id={headingId} className="font-display text-h3 font-semibold leading-title tracking-title text-fg">
      {heading}
    </h2>
    <div className="relative mt-8">
      {/* Connecting line through the badge centres (size-11 badges). */}
      <span
        aria-hidden="true"
        className="absolute bottom-5.5 left-5.5 top-5.5 w-px bg-linear-to-b from-brand via-line-strong to-line"
      />
      <RevealGrid as="ol" itemAs="li" className="relative grid gap-7">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-5">
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-raised font-display text-sm font-semibold tabular-nums text-fg">
              <span
                aria-hidden="true"
                className="absolute inset-1 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_75%)] opacity-40"
              />
              <span className="relative">{pad(i + 1)}</span>
            </span>
            <div className="pt-2.5">
              <h3 className="font-medium text-fg">{step.title}</h3>
              {step.detail && <p className="mt-1 text-sm text-muted">{step.detail}</p>}
            </div>
          </div>
        ))}
      </RevealGrid>
    </div>
  </div>
);
