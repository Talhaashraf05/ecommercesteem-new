import { describe, expect, it } from "vitest";
import { pageMetadata, sitemapEntries } from "./seo";
import { breadcrumbLd } from "./structured-data";

describe("seo", () => {
  it("sets canonical and OG url from path", () => {
    const m = pageMetadata({ title: "About", description: "d", path: "/about" });
    expect(m.alternates?.canonical).toBe("/about");
    expect(m.openGraph?.url).toBe("/about");
  });
  it("defaults OG and twitter image, allows override", () => {
    const d = pageMetadata({ description: "d", path: "/x" });
    expect(d.openGraph?.images).toEqual(["/opengraph-image"]);
    expect(d.twitter?.images).toEqual(["/opengraph-image"]);
    const o = pageMetadata({ description: "d", path: "/x", image: "/a.png" });
    expect(o.openGraph?.images).toEqual(["/a.png"]);
    expect(o.twitter?.images).toEqual(["/a.png"]);
  });
  it("sitemap lists every static and dynamic page once", () => {
    const urls = sitemapEntries().map((e) => new URL(e.url).pathname);
    for (const p of ["/", "/services", "/services/amazon-ppc", "/work", "/work/hulkfit", "/about", "/contact", "/careers", "/privacy"]) {
      expect(urls).toContain(p);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });
  it("builds ordered breadcrumbs with absolute URLs", () => {
    const ld = breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "Amazon PPC", path: "/services/amazon-ppc" }]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement.map((e) => e.position)).toEqual([1, 2, 3]);
    expect(ld.itemListElement[2].item).toMatch(/^https?:\/\/.+\/services\/amazon-ppc$/);
  });
});
