import { getPricing, offices, site } from "@/content";
import type { Job, Service } from "@/content/schemas";
import { siteConfig } from "@/lib/site";

const abs = (path: string) => `${siteConfig.url}${path === "/" ? "" : path}` || siteConfig.url;
const ORG_ID = `${siteConfig.url}/#organization`;

export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: site.name,
      url: siteConfig.url,
      logo: abs("/brand/logo-mark-white.png"),
      sameAs: [site.linkedin],
      email: site.email,
      telephone: site.phone,
      parentOrganization: { "@type": "Organization", name: site.parentCompany.name },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteConfig.url}/#service`,
      name: site.name,
      url: siteConfig.url,
      parentOrganization: { "@id": ORG_ID },
      address: offices.map((o) => ({ "@type": "PostalAddress", streetAddress: o.address, addressCountry: o.countryCode })),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: site.name,
      url: siteConfig.url,
      publisher: { "@id": ORG_ID },
    },
  ],
});

/** "$1,485/mo" -> 1485; non-numeric ("Custom") -> undefined. */
const parsePrice = (price: string): number | undefined => {
  const m = price.match(/\d[\d,]*(?:\.\d+)?/);
  return m ? Number(m[0].replace(/,/g, "")) : undefined;
};

export const serviceLd = (s: Service) => {
  const price = parsePrice(getPricing(s.pricingGroup).tiers[0].price);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.summary,
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
    ...(price !== undefined ? { offers: { "@type": "Offer", price, priceCurrency: "USD" } } : {}),
  };
};

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: abs(it.path),
  })),
});

const EMPLOYMENT: Record<string, string> = { "full time": "FULL_TIME", "part time": "PART_TIME", contract: "CONTRACTOR", internship: "INTERN" };

export const jobPostingLd = (job: Job) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: job.title,
  description: job.overview.join(" "),
  datePosted: new Date().toISOString().slice(0, 10),
  employmentType: EMPLOYMENT[job.mode.toLowerCase()] ?? "OTHER",
  hiringOrganization: { "@type": "Organization", name: site.name, sameAs: siteConfig.url },
  jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: job.location } },
});
