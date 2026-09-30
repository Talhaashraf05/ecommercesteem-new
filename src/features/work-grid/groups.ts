// Filter groups for the /work grid. Zod-free, so the client grid can import it.
import type { ServiceSlug } from "@/content/service-slugs";

export type WorkGroup = "all" | "amazon" | "meta" | "google" | "retention";

export const WORK_GROUPS: { id: WorkGroup; label: string }[] = [
  { id: "all", label: "All" },
  { id: "amazon", label: "Amazon" },
  { id: "meta", label: "Meta" },
  { id: "google", label: "Google" },
  { id: "retention", label: "Retention & SEO" },
];

const MAP: Record<ServiceSlug, Exclude<WorkGroup, "all">> = {
  "amazon-account-management": "amazon",
  "amazon-ppc": "amazon",
  "amazon-listings-a-plus": "amazon",
  "meta-ads": "meta",
  "google-ads": "google",
  "email-marketing": "retention",
  seo: "retention",
};

export const inGroup = (services: readonly ServiceSlug[], g: WorkGroup) =>
  g === "all" || services.some((s) => MAP[s] === g);
