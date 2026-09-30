import type { Metadata, MetadataRoute } from "next";
import { caseStudies, jobs, services } from "@/content";
import { siteConfig } from "@/lib/site";

export const pageMetadata = ({ title, description, path, image }: { title?: string; description: string; path: string; image?: string }): Metadata => ({
  title: title ?? { absolute: "EcommerceSteem | E-commerce Growth Agency for Amazon, Meta & Google" },
  description,
  alternates: { canonical: path },
  openGraph: { title: title ?? siteConfig.name, description, url: path, siteName: siteConfig.name, type: "website", locale: "en_US", ...(image ? { images: [image] } : {}) },
  twitter: { card: "summary_large_image", title: title ?? siteConfig.name, description },
});

const STATIC = ["/", "/services", "/work", "/about", "/contact", "/careers", "/privacy"];

export const sitemapEntries = (): MetadataRoute.Sitemap => {
  const now = new Date();
  const paths = [
    ...STATIC,
    ...services.map((s) => `/services/${s.slug}`),
    ...caseStudies.map((c) => `/work/${c.slug}`),
    ...jobs.filter((j) => j.active).map((j) => `/careers/${j.id}`),
  ];
  return paths.map((p) => ({ url: `${siteConfig.url}${p === "/" ? "" : p}` || siteConfig.url, lastModified: now, priority: p === "/" ? 1 : 0.7 }));
};
