import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, statSync } from "node:fs";
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
    z.array(S.ServiceSchema).length(5).parse(C.services);
    z.array(S.PricingGroupSchema).length(3).parse(C.pricing);
  });
  it("every service has a tagline of at most 40 characters", () => {
    for (const s of C.services) {
      expect(s.tagline.length).toBeGreaterThan(0);
      expect(s.tagline.length).toBeLessThanOrEqual(40);
    }
  });
  it("every service slug is unique and resolves", () => {
    expect(new Set(C.services.map((s) => s.slug)).size).toBe(5);
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
    expect(first("email-marketing")).toBe("$749/mo");
    expect(first("seo")).toBe("$700/mo");
  });
});

describe("case studies, faq, jobs", () => {
  it("validates", () => {
    z.array(S.CaseStudySchema).length(5).parse(C.caseStudies);
    z.array(S.FaqSchema).min(6).max(8).parse(C.homeFaq);
    z.array(S.JobSchema).min(1).parse(C.jobs);
  });
  it("case study clients are real clients", () => {
    const names = new Set(C.clients.map((c) => c.name));
    for (const cs of C.caseStudies) expect(names.has(cs.client), cs.client).toBe(true);
  });
  it("drafts are flagged unverified", () => {
    expect(C.caseStudies.every((cs) => cs.verified === false)).toBe(true);
  });
  it("activeJobs only has active roles", () => {
    expect(C.activeJobs.every((j) => j.active)).toBe(true);
  });
});

describe("timeline, careers, team", () => {
  it("validates lengths", () => {
    z.array(S.TimelineItemSchema).length(6).parse(C.timeline);
    z.array(S.HiringStepSchema).length(4).parse(C.hiringSteps);
    z.array(S.TeamMemberSchema).length(0).parse(C.team);
  });
  it("drafted timeline and hiring steps are flagged unverified", () => {
    expect(C.timeline.every((t) => t.verified === false)).toBe(true);
    expect(C.hiringSteps.every((h) => h.verified === false)).toBe(true);
  });
});

describe("contact page", () => {
  it("has three next steps, drafted ones flagged unverified", () => {
    const steps = C.contactPage.nextSteps.steps;
    expect(steps.map((s) => s.title)).toEqual(["We reply within one business day", "Free audit call", "Your growth plan"]);
    expect(steps.every((s) => !s.detail || !/^[a-z]/.test(s.detail))).toBe(true);
    expect(steps.filter((s) => s.detail).every((s) => s.verified === false)).toBe(true);
  });
});

describe("images", () => {
  it("every referenced image exists", () => {
    const refs = [...C.services.map((s) => s.image), ...C.caseStudies.map((c) => c.image), ...C.caseStudies.flatMap((c) => (c.workImage ? [c.workImage] : [])), ...C.homeWork.map((w) => w.image), "/images/team-work.webp"];
    for (const r of refs) expect(existsSync(pub(r)), r).toBe(true);
  });
  it("every optimised photo is at most 400 KB", () => {
    const files = readdirSync(pub("/images")).filter((f) => f.endsWith(".webp"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(statSync(pub(`/images/${f}`)).size, f).toBeLessThanOrEqual(400_000);
  });
});

describe("work page", () => {
  it("featured slug resolves to an existing case study", () => {
    expect(C.caseStudies.some((cs) => cs.slug === C.workPage.featured.slug), C.workPage.featured.slug).toBe(true);
  });
});

describe("about page", () => {
  it("stat ids resolve to stats", () => {
    const ids = new Set(C.stats.map((s) => s.id));
    const { collabStatId, dataStatId, reachStatId } = C.aboutPage.stats;
    for (const id of [collabStatId, dataStatId, reachStatId]) expect(ids.has(id), id).toBe(true);
  });
  it("quoted testimonial exists by name", () => {
    const author = C.aboutPage.stats.commitment.quoteAuthor;
    expect(C.testimonials.some((t) => t.name === author), author).toBe(true);
  });
  it("drafted claims are flagged unverified", () => {
    expect(C.aboutPage.offices.lead.verified).toBe(false);
    expect(C.contactPage.trust.line.verified).toBe(false);
  });
});
