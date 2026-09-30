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
