import { Container } from "./container";
import { Eyebrow } from "./eyebrow";

export interface CinematicHeroStat {
  value: string;
  label: string;
}

export interface CinematicHeroProps {
  eyebrow: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
  stats?: CinematicHeroStat[];
  /** Decorative backdrop (usually a `HeroScene`), right of the copy on desktop. */
  scene?: React.ReactNode;
  size?: "full" | "tall";
}

const HEIGHT = { full: "min-h-lvh", tall: "min-h-[80lvh]" } as const;

/**
 * Inner-page hero: copy on the left over a masked scene slot that sits behind
 * and to the right of it. A scrim between the two keeps the headline on the
 * page background rather than on the particles.
 */
export const CinematicHero = ({ eyebrow, title, lead, actions, stats, scene, size = "full" }: CinematicHeroProps) => (
  <header className={`relative isolate flex flex-col justify-center overflow-hidden px-gutter pb-20 pt-40 ${HEIGHT[size]}`}>
    {scene && (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_75%_40%_at_50%_30%,black_35%,transparent_100%)] lg:left-1/3 lg:[mask-image:radial-gradient(ellipse_45%_60%_at_70%_50%,black_45%,transparent_100%)]"
      >
        {/* Mobile: the scene fills the top of the hero, above the copy.
            Desktop: its box runs past the right edge, centring the shape
            right of the headline rather than under it. */}
        <div className="absolute inset-x-0 top-0 h-3/5 lg:-right-1/5 lg:left-1/5 lg:h-full">{scene}</div>
      </div>
    )}
    {/* Scrim: darkens the scene under the copy (all of it on mobile, the left edge on desktop). */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-bg/20 via-bg/60 via-45% to-bg lg:bg-linear-to-r lg:from-bg lg:via-bg/80 lg:via-50% lg:to-transparent lg:to-75%"
    />
    <Container>
      <div className="max-w-title">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-8 font-display text-display font-semibold leading-title tracking-title text-fg">{title}</h1>
        {lead && <p className="mt-6 max-w-lead text-lead text-muted">{lead}</p>}
        {actions && <div className="mt-10 flex flex-wrap items-center gap-4">{actions}</div>}
        {stats && stats.length > 0 && (
          <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-kicker text-muted">{stat.label}</dt>
                <dd className="font-display text-h3 font-semibold text-fg">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Container>
  </header>
);
