import { describe, expect, it } from "vitest";
import { ContactSchema } from "./schema";

const ok = { name: "Ann", email: "ann@shop.com", message: "We need help with Amazon PPC." };

describe("ContactSchema", () => {
  it("accepts a minimal valid lead", () => expect(ContactSchema.parse(ok)).toMatchObject(ok));
  it("rejects bad email and short message", () => {
    expect(ContactSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false);
    expect(ContactSchema.safeParse({ ...ok, message: "hi" }).success).toBe(false);
  });
  it("rejects unknown service slugs", () => {
    expect(ContactSchema.safeParse({ ...ok, service: "ftl-shipping" }).success).toBe(false);
    expect(ContactSchema.safeParse({ ...ok, service: "amazon-ppc" }).success).toBe(true);
  });
});
