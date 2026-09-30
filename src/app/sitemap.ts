import type { MetadataRoute } from "next";

import { sitemapEntries } from "@/lib/seo";

/** Generates `/sitemap.xml` from the content layer. */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
