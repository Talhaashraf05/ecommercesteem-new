import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import * as C from "@/content";
import * as S from "@/content/schemas";

const pub = (p: string) => path.join(__dirname, "../../public", p);

describe("core content", () => {
  it("validates against schemas", () => {
    S.SiteSchema.parse(C.site);
    z.array(S.OfficeSchema).length(3).parse(C.offices);
    z.array(S.StatSchema).length(3).parse(C.stats);
    z.array(S.ClientSchema).length(8).parse(C.clients);
    z.array(S.TestimonialSchema).length(7).parse(C.testimonials);
    z.array(S.ProcessStepSchema).length(5).parse(C.processSteps);
    z.array(S.ValueSchema).length(5).parse(C.values);
  });
  it("client logos exist on disk", () => {
    for (const c of C.clients) expect(existsSync(pub(c.logo)), c.logo).toBe(true);
  });
  it("has no template leftovers or typos", () => {
    const blob = JSON.stringify(C).toLowerCase();
    for (const bad of ["startpack", "ecommerceesteem", "freight", "ftl", "lorem"]) {
      expect(blob).not.toContain(bad);
    }
  });
});

describe("services & pricing", () => {
  it("validates", () => {
    z.array(S.ServiceSchema).length(7).parse(C.services);
    z.array(S.PricingGroupSchema).length(5).parse(C.pricing);
  });
  it("every service slug is unique and resolves", () => {
    expect(new Set(C.services.map((s) => s.slug)).size).toBe(7);
    for (const s of C.services) expect(C.getService(s.slug)).toBe(s);
    expect(C.getService("ftl-shipping")).toBeUndefined();
  });
  it("every service pricing group exists; pdfs exist", () => {
    for (const s of C.services) {
      expect(C.getPricing(s.pricingGroup).id).toBe(s.pricingGroup);
      if (s.pdf) expect(existsSync(pub(s.pdf)), s.pdf).toBe(true);
    }
  });
  it("uses the agreed starting prices", () => {
    const first = (id: S.PricingGroupId) => C.getPricing(id).tiers[0].price;
    expect(first("amazon")).toBe("$500/mo");
    expect(first("meta-ads")).toBe("$449/mo");
    expect(first("google-ads")).toBe("$349/mo");
    expect(first("email-marketing")).toBe("$749/mo");
    expect(first("seo")).toBe("$700/mo");
  });
});
