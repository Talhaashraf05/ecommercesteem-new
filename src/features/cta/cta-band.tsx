import { GlassButton } from "@/components/ui/glass-button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

interface CtaLink { label: string; href: string }

export const CtaBand = ({ title, body, primary, secondary }: { title: string; body: string; primary: CtaLink; secondary?: CtaLink }) => (
  <Section labelledBy="cta-title">
    <Container>
      <div className="rounded-[2rem] border border-line bg-[radial-gradient(ellipse_at_top,var(--brand)_0%,transparent_60%)] p-12 text-center md:p-20">
        <h2 id="cta-title" className="font-display text-display-sm font-semibold leading-title tracking-title text-fg">{title}</h2>
        <p className="mx-auto mt-6 max-w-lead text-lead text-fg">{body}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <GlassButton href={primary.href} withArrow>{primary.label}</GlassButton>
          {secondary && <GlassButton href={secondary.href} variant="secondary">{secondary.label}</GlassButton>}
        </div>
      </div>
    </Container>
  </Section>
);
