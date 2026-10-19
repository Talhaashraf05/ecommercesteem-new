import { z } from "zod";

import { SERVICE_SLUGS } from "./service-slugs";

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
  about: z.object({ story: z.string(), missionTitle: z.string(), mission: z.string() }),
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

export { SERVICE_SLUGS };
export const PRICING_GROUPS = ["amazon", "email-marketing", "seo"] as const;

export const ServiceSchema = z.object({
  slug: z.enum(SERVICE_SLUGS),
  group: z.enum(["amazon", "retention"]),
  name: z.string(),
  shortName: z.string(),
  tagline: z.string().max(40),
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

export type { ServiceSlug } from "./service-slugs";
export type PricingGroupId = (typeof PRICING_GROUPS)[number];
export type ServiceGroup = z.infer<typeof ServiceSchema>["group"];
export type Service = z.infer<typeof ServiceSchema>;
export type PricingTier = z.infer<typeof PricingTierSchema>;
export type PricingGroup = z.infer<typeof PricingGroupSchema>;

export const MetricSchema = z.object({ value: z.string(), label: z.string() });

export const CaseStudySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  client: z.string(),
  category: z.string(),
  year: z.string().regex(/^\d{4}$/),
  services: z.array(z.enum(SERVICE_SLUGS)).min(1),
  headlineMetric: MetricSchema,
  metrics: z.array(MetricSchema).min(1).max(3),
  challenge: z.string(),
  approach: z.array(z.string()).min(3).max(5),
  outcome: z.string(),
  image: z.string().startsWith("/images/"),
  verified: z.boolean(),
});

export const FaqSchema = z.object({ q: z.string(), a: z.string() });

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  type: z.string(),
  mode: z.string(),
  experience: z.string(),
  location: z.string(),
  active: z.boolean(),
  overview: z.array(z.string()),
  whatYoullDo: z.array(z.string()),
  whatYoullBring: z.array(z.string()),
});

export type CaseStudy = z.infer<typeof CaseStudySchema>;
export type Faq = z.infer<typeof FaqSchema>;
export type Job = z.infer<typeof JobSchema>;

export const TimelineItemSchema = z.object({
  year: z.string(),
  title: z.string(),
  body: z.string().max(140),
  verified: z.boolean(),
});

export const HiringStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  verified: z.boolean(),
});

export const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  photo: z.string().startsWith("/images/"),
});

export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type HiringStep = z.infer<typeof HiringStepSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
