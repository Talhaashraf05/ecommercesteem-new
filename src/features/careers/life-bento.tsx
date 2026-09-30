// "Life at EcommerceSteem": a six-tile bento built only from real content: three
// values, the offices (country list plus a small office map) and two stats. Server
// component; RevealGrid, HoverRing, CountUp and the map pulse are the client islands.
import type { Office, Stat, Value } from "@/content/schemas";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { HoverRing } from "@/components/ui/hover-ring";
import { RevealGrid } from "@/components/ui/reveal-grid";
import { Section } from "@/components/ui/section";
import { OfficeMap } from "@/features/office-map/office-map";
import type { PulseMarker } from "@/features/office-map/office-pulse";
import { valueIcon } from "@/features/values/values-bento";

const HEADING_ID = "life-title";
const CARD =
  "relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface-glass p-8 backdrop-blur-md";

export interface LifeBentoCopy {
  heading: string;
  lead: string;
  officesLabel: string;
  officesBody: string;
}

export interface LifeBentoProps {
  values: Value[];
  offices: Office[];
  stats: Stat[];
  /** Map pin per office, keyed by country code. */
  markers: Record<string, PulseMarker>;
  copy: LifeBentoCopy;
}

const ValueTile = ({ value }: { value: Value }) => (
  <article className={`${CARD} min-h-64`}>
    <span className="flex size-12 items-center justify-center rounded-2xl border border-line-strong bg-surface-raised text-brand-glow">
      {valueIcon(value.title)}
    </span>
    <h3 className="mt-auto pt-10 font-display text-h3 font-semibold leading-title tracking-title text-fg">
      {value.title}
    </h3>
    <p className="mt-3 text-muted">{value.description}</p>
  </article>
);

const StatTile = ({ stat }: { stat: Stat }) => (
  <article className={`${CARD} min-h-64`}>
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_70%)] opacity-20"
    />
    <h3 className="relative text-kicker text-muted">{stat.label}</h3>
    <p className="relative mt-auto pt-10 font-display text-stat font-semibold leading-title tracking-title text-fg">
      <CountUp value={stat.value} />
    </p>
    <p className="relative mt-3 text-muted">{stat.description}</p>
  </article>
);

const OfficesTile = ({ offices, markers, copy }: Pick<LifeBentoProps, "offices" | "markers" | "copy">) => (
  <article className={`${CARD} min-h-96 md:p-10`}>
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[radial-gradient(circle,var(--brand)_0%,transparent_70%)] opacity-20"
    />
    <h3 className="relative font-display text-display-sm font-semibold leading-title tracking-title text-fg">
      {copy.officesLabel}
    </h3>
    <p className="relative mt-3 max-w-md text-lead text-muted">{copy.officesBody}</p>
    <OfficeMap
      className="relative my-8 w-full"
      markers={offices.flatMap((o) => (markers[o.countryCode] ? [markers[o.countryCode]] : []))}
    />
    <ul className="relative mt-auto flex flex-wrap gap-3">
      {offices.map((o) => (
        <li
          key={o.countryCode}
          className="flex items-center gap-3 rounded-full border border-line bg-surface-raised px-4 py-2 text-sm text-fg"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-brand shadow-[0_0_0.5rem_var(--brand-glow)]" />
          {o.country}
          {markers[o.countryCode] && <span className="text-muted">{markers[o.countryCode].label}</span>}
        </li>
      ))}
    </ul>
  </article>
);

/**
 * Tiles (DOM order): offices, value, stat, value, stat, value. On desktop the
 * offices tile spans 2×2 of a three-column grid; on tablet it spans the full
 * two-column row and the last tile does too, so no cell is left empty.
 */
export const LifeBento = ({ values, offices, stats, markers, copy }: LifeBentoProps) => {
  const [v1, v2, v3] = values;
  const [s1, s2] = stats;
  const tiles: { key: string; node: React.ReactNode }[] = [
    { key: "offices", node: <OfficesTile offices={offices} markers={markers} copy={copy} /> },
    ...(v1 ? [{ key: v1.title, node: <ValueTile value={v1} /> }] : []),
    ...(s1 ? [{ key: s1.id, node: <StatTile stat={s1} /> }] : []),
    ...(v2 ? [{ key: v2.title, node: <ValueTile value={v2} /> }] : []),
    ...(s2 ? [{ key: s2.id, node: <StatTile stat={s2} /> }] : []),
    ...(v3 ? [{ key: v3.title, node: <ValueTile value={v3} /> }] : []),
  ];

  return (
    <Section labelledBy={HEADING_ID} tone="raised">
      <Container>
        <AnimatedHeading
          as="h2"
          id={HEADING_ID}
          className="font-display text-display-sm font-semibold leading-title tracking-title text-fg"
        >
          {copy.heading}
        </AnimatedHeading>
        <p className="mt-6 max-w-lead text-lead text-muted">{copy.lead}</p>
        <RevealGrid
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          // A string, not a function: this is a server component passing props to a client one.
          itemClassName="md:first:col-span-2 lg:first:row-span-2 md:last:col-span-2 lg:last:col-span-1"
        >
          {tiles.map((tile) => (
            <HoverRing key={tile.key} className="h-full rounded-3xl">
              {tile.node}
            </HoverRing>
          ))}
        </RevealGrid>
      </Container>
    </Section>
  );
};
