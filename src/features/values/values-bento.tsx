// "What we stand for" — the values as a bento of glass cards: two large cards over three
// small ones. Server component; the reveal cascade (RevealGrid) and hover ring
// (HoverRing) are the only client islands.
import type { Value } from "@/content/schemas";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import { HoverRing } from "@/components/ui/hover-ring";
import { RevealGrid } from "@/components/ui/reveal-grid";
import { Section } from "@/components/ui/section";

const HEADING_ID = "values-title";
const LARGE = 2; // first N values get the large cards (keep in sync with itemClassName)

const Glyph = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    className="size-6"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** Line icon per value title; unknown titles fall back to a spark. */
const ICONS: Record<string, React.ReactNode> = {
  Integrity: (
    <Glyph>
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </Glyph>
  ),
  Innovation: (
    <Glyph>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-3.6 10.8c.6.5 1 1.2 1.1 2.2h5c.1-1 .5-1.7 1.1-2.2A6 6 0 0012 3z" />
    </Glyph>
  ),
  Excellence: (
    <Glyph>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" />
    </Glyph>
  ),
  "Client Success": (
    <Glyph>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Glyph>
  ),
  Collaboration: (
    <Glyph>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c.6-.3 1.3-.5 2-.5 2.2 0 4 1.8 4 4" />
    </Glyph>
  ),
};

const SPARK = (
  <Glyph>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
  </Glyph>
);

/** The line icon for a value title (a spark for unknown titles). */
export const valueIcon = (title: string) => ICONS[title] ?? SPARK;

const pad = (n: number) => String(n).padStart(2, "0");

export interface ValuesBentoProps {
  values: Value[];
  heading: string;
}

export const ValuesBento = ({ values, heading }: ValuesBentoProps) => (
  <Section labelledBy={HEADING_ID} tone="raised">
    <Container>
      <AnimatedHeading
        as="h2"
        id={HEADING_ID}
        className="font-display text-display-sm font-semibold leading-title tracking-title text-fg"
      >
        {heading}
      </AnimatedHeading>
      <RevealGrid
        as="ul"
        itemAs="li"
        className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-6"
        // A string, not a function: this is a server component passing props to a client one.
        itemClassName="md:col-span-2 md:[&:nth-child(-n+2)]:col-span-3"
      >
        {values.map((v, i) => {
          const large = i < LARGE;
          return (
            <HoverRing key={v.title} className="h-full rounded-3xl">
              <article
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface-glass p-8 backdrop-blur-md ${
                  large ? "min-h-80 md:p-10" : "min-h-64"
                }`}
              >
                {large && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_70%)] opacity-25"
                  />
                )}
                <div className="relative flex items-start justify-between gap-6">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-line-strong bg-surface-raised text-brand-glow">
                    {valueIcon(v.title)}
                  </span>
                  <span aria-hidden="true" className="font-display text-kicker tabular-nums text-muted">
                    {pad(i + 1)}
                  </span>
                </div>
                <h3
                  className={`relative mt-auto pt-12 font-display font-semibold leading-title tracking-title text-fg ${
                    large ? "text-display-sm" : "text-h3"
                  }`}
                >
                  {v.title}
                </h3>
                <p className={`relative mt-3 text-muted ${large ? "max-w-md text-lead" : ""}`}>{v.description}</p>
              </article>
            </HoverRing>
          );
        })}
      </RevealGrid>
    </Container>
  </Section>
);
