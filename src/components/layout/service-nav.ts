import { serviceGroups, services } from "@/content";

export type ServiceNavGroup = {
  id: string;
  label: string;
  items: { slug: string; name: string; summary: string }[];
};

// Built on the server and passed to the client menus as props, so the full
// content barrel (service details, jobs, pricing…) stays out of the client bundle.
export const serviceNav: ServiceNavGroup[] = serviceGroups.map((g) => ({
  id: g.id,
  label: g.label,
  items: services
    .filter((s) => s.group === g.id)
    .map(({ slug, name, summary }) => ({ slug, name, summary })),
}));
