// Filter groups for the /work index. Zod-free, so the client index can import it.
import type { ServiceSlug } from "@/content/service-slugs";

export type WorkGroup = "all" | "amazon" | "retention";

export const WORK_GROUPS: { id: WorkGroup; label: string }[] = [
  { id: "all", label: "All" },
  { id: "amazon", label: "Amazon" },
  { id: "retention", label: "Retention & SEO" },
];

const MAP: Record<ServiceSlug, Exclude<WorkGroup, "all">> = {
  "amazon-account-management": "amazon",
  "amazon-ppc": "amazon",
  "amazon-listings-a-plus": "amazon",
  "email-marketing": "retention",
  seo: "retention",
};

export const inGroup = (services: readonly ServiceSlug[], g: WorkGroup) =>
  g === "all" || services.some((s) => MAP[s] === g);
