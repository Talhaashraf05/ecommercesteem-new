import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { WORK_GROUPS, inGroup, type WorkGroup } from "./groups";

const slugsIn = (g: WorkGroup) => caseStudies.filter((c) => inGroup(c.services, g)).map((c) => c.slug);

describe("work groups", () => {
  it("lists All first, then the four service groups", () => {
    expect(WORK_GROUPS.map((g) => g.id)).toEqual(["all", "amazon", "retention"]);
  });
  it("puts every case study in All", () => {
    expect(slugsIn("all")).toEqual(caseStudies.map((c) => c.slug));
  });
  it("maps Amazon services", () => {
    expect(slugsIn("amazon")).toEqual(expect.arrayContaining(["hulkfit", "sinkliners", "bluestem"]));
  });
  it("maps email and SEO to Retention & SEO", () => {
    expect(slugsIn("retention")).toEqual(expect.arrayContaining(["huskey-parts", "revival"]));
  });
  it("excludes studies with no service in the group", () => {
    expect(slugsIn("amazon")).not.toContain("revival");
    expect(slugsIn("retention")).not.toContain("hulkfit");
  });
});
