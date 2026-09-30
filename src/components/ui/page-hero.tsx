import { Container } from "./container";
import { Eyebrow } from "./eyebrow";

export interface PageHeroProps {
  eyebrow: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
}

export const PageHero = ({ eyebrow, title, lead, actions }: PageHeroProps) => (
  <header className="relative overflow-hidden px-gutter pb-20 pt-40">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top,var(--brand)_0%,transparent_60%)] opacity-25"
    />
    <Container className="relative">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-8 max-w-title font-display text-display font-semibold leading-title tracking-title text-fg">{title}</h1>
      {lead && <p className="mt-6 max-w-lead text-lead text-muted">{lead}</p>}
      {actions && <div className="mt-10 flex flex-wrap items-center gap-4">{actions}</div>}
    </Container>
  </header>
);
