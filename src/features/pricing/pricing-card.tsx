import { ButtonLink } from "@/components/ui/button";
import type { PricingTier } from "@/content/schemas";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand">
    <path d="M5 12l5 5 9-10" />
  </svg>
);

export const PricingCard = ({ tier, serviceSlug }: { tier: PricingTier; serviceSlug: string }) => {
  const custom = tier.price === "Custom";
  const [amount, period] = tier.price.split("/");
  return (
    <article className={`relative flex flex-col rounded-3xl border p-8 ${tier.highlighted ? "border-brand bg-surface-raised" : "border-line bg-surface"}`}>
      {tier.highlighted && (
        <span className="absolute right-6 top-6 rounded-full bg-brand px-3 py-1 text-kicker text-fg">Most popular</span>
      )}
      <h3 className="text-kicker text-muted">{tier.name}</h3>
      <p className="mt-6 text-sm text-muted">{custom ? " " : "Starting at"}</p>
      <p className="font-display text-stat text-fg">
        {amount}
        {period && <span className="text-lead text-muted">/{period}</span>}
      </p>
      <p className="mt-1 text-sm text-muted">{tier.priceNote}</p>
      <ul className="mt-8 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-3 text-sm text-fg">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <ButtonLink
        href={`/contact?service=${serviceSlug}&plan=${encodeURIComponent(tier.name)}`}
        variant={tier.highlighted ? "primary" : "secondary"}
        className="mt-8 w-full"
      >
        {custom ? "Talk to us" : "Get started"}
      </ButtonLink>
    </article>
  );
};
