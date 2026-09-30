"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import type { PricingGroup, PricingGroupId } from "@/content/schemas";
import { PricingCard } from "./pricing-card";

const ID_PREFIX = "pricing";

export const PricingTabs = ({ groups, initial }: { groups: PricingGroup[]; initial?: PricingGroupId }) => {
  const [active, setActive] = useState<string>(initial ?? groups[0].id);
  const group = groups.find((g) => g.id === active) ?? groups[0];
  const serviceSlug = group.id === "amazon" ? "amazon-account-management" : group.id;
  return (
    <div>
      <Tabs tabs={groups.map((g) => ({ id: g.id, label: g.label }))} value={group.id} onChange={setActive} idPrefix={ID_PREFIX} />
      <div role="tabpanel" id={`${ID_PREFIX}-panel`} aria-labelledby={`${ID_PREFIX}-tab-${group.id}`} className="mt-10">
        <p className="max-w-lead text-lead text-muted">{group.intro}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {group.tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} serviceSlug={serviceSlug} />
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">Ad spend is billed directly by the platform and is not included.</p>
        <ButtonLink href={`/files/${group.id}-pricing.pdf`} variant="ghost" external className="mt-4 text-sm">
          Download full pricing (PDF)
        </ButtonLink>
      </div>
    </div>
  );
};
