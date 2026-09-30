import { describe, expect, it } from "vitest";
import { redirects } from "./redirects";

const to = (s: string) => redirects.find((r) => r.source === s)?.destination;

describe("legacy redirects", () => {
  it("maps old routes", () => {
    expect(to("/career")).toBe("/careers");
    expect(to("/career-details/:id")).toBe("/careers/:id");
    expect(to("/career/form")).toBe("/careers");
    expect(to("/casestudy")).toBe("/work");
    expect(to("/projects")).toBe("/work");
    expect(to("/project")).toBe("/work");
    expect(to("/privacy-policy")).toBe("/privacy");
    expect(to("/services/amazon")).toBe("/services/amazon-account-management");
    expect(to("/services/ftl-shipping")).toBe("/services");
    expect(to("/services/web-development")).toBe("/services");
  });
  it("all permanent", () => expect(redirects.every((r) => r.permanent)).toBe(true));
});
