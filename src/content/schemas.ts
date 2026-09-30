import { z } from "zod";

export const SiteSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  email: z.email(),
  privacyEmail: z.email(),
  phone: z.string(),
  phoneHref: z.string().startsWith("tel:"),
  hours: z.string(),
  linkedin: z.url(),
  portal: z.url(),
  parentCompany: z.object({ name: z.string(), address: z.string() }),
  disclaimer: z.string(),
});

export const OfficeSchema = z.object({
  country: z.string(),
  address: z.string(),
  phone: z.string().optional(),
  countryCode: z.string().length(2),
});

export const StatSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
  description: z.string(),
  verified: z.boolean(),
});

export const ClientSchema = z.object({
  name: z.string(),
  logo: z.string().startsWith("/clients/"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const TestimonialSchema = z.object({
  name: z.string(),
  source: z.enum(["Upwork", "Clutch"]),
  location: z.string().optional(),
  date: z.string(),
  quote: z.string().min(10),
  rating: z.number().int().min(1).max(5),
});

export const ProcessStepSchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  title: z.string(),
  description: z.string(),
});

export const ValueSchema = z.object({ title: z.string(), description: z.string() });

export type Site = z.infer<typeof SiteSchema>;
export type Office = z.infer<typeof OfficeSchema>;
export type Stat = z.infer<typeof StatSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type ProcessStep = z.infer<typeof ProcessStepSchema>;
export type Value = z.infer<typeof ValueSchema>;

export const SERVICE_SLUGS = [
  "amazon-account-management",
  "amazon-ppc",
  "amazon-listings-a-plus",
  "meta-ads",
  "google-ads",
  "email-marketing",
  "seo",
] as const;
export const PRICING_GROUPS = ["amazon", "meta-ads", "google-ads", "email-marketing", "seo"] as const;

export const ServiceSchema = z.object({
  slug: z.enum(SERVICE_SLUGS),
  group: z.enum(["amazon", "paid", "retention"]),
  name: z.string(),
  shortName: z.string(),
  summary: z.string().max(160),
  description: z.string(),
  image: z.string().startsWith("/images/"),
  included: z.array(z.string()).min(4),
  steps: z.array(z.object({ title: z.string(), description: z.string() })).length(4),
  tags: z.array(z.string()).min(3),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3),
  pricingGroup: z.enum(PRICING_GROUPS),
  pdf: z.string().startsWith("/files/").optional(),
});

export const PricingTierSchema = z.object({
  name: z.string(),
  price: z.string(),
  priceNote: z.string(),
  highlighted: z.boolean(),
  features: z.array(z.string()).length(5),
});

export const PricingGroupSchema = z.object({
  id: z.enum(PRICING_GROUPS),
  label: z.string(),
  intro: z.string(),
  tiers: z.array(PricingTierSchema).length(4),
});

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];
export type PricingGroupId = (typeof PRICING_GROUPS)[number];
export type ServiceGroup = z.infer<typeof ServiceSchema>["group"];
export type Service = z.infer<typeof ServiceSchema>;
export type PricingTier = z.infer<typeof PricingTierSchema>;
export type PricingGroup = z.infer<typeof PricingGroupSchema>;
