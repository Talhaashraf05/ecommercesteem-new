// Zod-free so client components (contact form) can import it without pulling
// the content schemas — and full zod — into their bundle.
export const SERVICE_SLUGS = [
  "amazon-account-management",
  "amazon-ppc",
  "amazon-listings-a-plus",
  "meta-ads",
  "google-ads",
  "email-marketing",
  "seo",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];
