import type { ServiceSlug } from "./service-icons";
import { visibleServiceGroups, visibleServices } from "@/content";

export type ServiceNavGroup = {
  id: string;
  label: string;
  items: { slug: ServiceSlug; name: string; shortName: string; tagline: string }[];
};

// Built on the server and passed to the client menus as props, so the full
// content barrel (service details, jobs, pricing…) stays out of the client bundle.
// Hidden services (e.g. email & SEO, paused for now) are excluded via visibleServices.
export const serviceNav: ServiceNavGroup[] = visibleServiceGroups.map((g) => ({
  id: g.id,
  label: g.label,
  items: visibleServices
    .filter((s) => s.group === g.id)
    .map(({ slug, name, shortName, tagline }) => ({ slug, name, shortName, tagline })),
}));
