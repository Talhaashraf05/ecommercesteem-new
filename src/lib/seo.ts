import type { Metadata, MetadataRoute } from "next";
import { caseStudies, jobs, services } from "@/content";
import { siteConfig } from "@/lib/site";

const HOME_TITLE = "EcommerceSteem | E-commerce Growth Agency for Amazon";

export const pageMetadata = ({ title, description, path, image = siteConfig.ogImage }: { title?: string; description: string; path: string; image?: string }): Metadata => {
  // The root layout's "%s | EcommerceSteem" template covers <title> only, so the
  // social titles get the same suffix here.
  const socialTitle = title ? `${title} | ${siteConfig.name}` : HOME_TITLE;
  return {
    title: title ?? { absolute: HOME_TITLE },
    description,
    alternates: { canonical: path },
    openGraph: { title: socialTitle, description, url: path, siteName: siteConfig.name, type: "website", locale: "en_US", images: [image] },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [image] },
  };
};

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
