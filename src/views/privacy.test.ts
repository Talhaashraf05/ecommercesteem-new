import { describe, expect, it } from "vitest";
import { toBlocks } from "./privacy";

describe("toBlocks", () => {
  it("turns short paragraphs after a lead-in into a list", () => {
    const long = "x".repeat(200);
    expect(toBlocks(["We use it to:", "Run things.", "Improve things.", long])).toEqual([
      { kind: "p", text: "We use it to:" },
      { kind: "ul", items: ["Run things.", "Improve things."] },
      { kind: "p", text: long },
    ]);
  });
  it("leaves paragraphs without a lead-in alone", () => {
    expect(toBlocks(["A.", "B."])).toHaveLength(2);
  });
  it("does not make a list from a single item", () => {
    expect(toBlocks(["Contact us at:", "Only one."])).toEqual([
      { kind: "p", text: "Contact us at:" },
      { kind: "p", text: "Only one." },
    ]);
  });
  it("marks a paragraph that is an email address", () => {
    expect(toBlocks(["Write to us at:", "privacy@ecommercesteem.com"])).toEqual([
      { kind: "p", text: "Write to us at:" },
      { kind: "email", address: "privacy@ecommercesteem.com" },
    ]);
  });
});
