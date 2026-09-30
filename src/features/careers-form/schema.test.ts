import { describe, expect, it } from "vitest";
import { CareersFieldsSchema, validateResume } from "./schema";

describe("validateResume", () => {
  it("accepts pdf/doc/docx under 4MB", () => {
    expect(validateResume({ name: "cv.pdf", size: 1000, type: "application/pdf" })).toBeNull();
    expect(validateResume({ name: "cv.docx", size: 1000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBeNull();
    expect(validateResume({ name: "cv.doc", size: 1000, type: "" })).toBeNull();
  });
  it("rejects big files", () => {
    expect(validateResume({ name: "cv.pdf", size: 4 * 1024 * 1024 + 1, type: "application/pdf" })).toMatch(/4 ?MB/);
    expect(validateResume({ name: "cv.pdf", size: 4 * 1024 * 1024, type: "application/pdf" })).toBeNull();
  });
  it("rejects other types", () => {
    expect(validateResume({ name: "cv.exe", size: 10, type: "application/x-msdownload" })).toMatch(/PDF/);
    expect(validateResume({ name: "cv.pdf.exe", size: 10, type: "application/pdf" })).toMatch(/PDF/);
  });
  it("rejects prototype-chain extensions and names without a dot", () => {
    expect(validateResume({ name: "x.constructor", size: 10, type: "" })).toMatch(/PDF/);
    expect(validateResume({ name: "x.toString", size: 10, type: "" })).toMatch(/PDF/);
    expect(validateResume({ name: "x.__proto__", size: 10, type: "" })).toMatch(/PDF/);
    expect(validateResume({ name: "pdf", size: 10, type: "" })).toMatch(/PDF/);
  });
  it("rejects empty files", () => {
    expect(validateResume({ name: "cv.pdf", size: 0, type: "application/pdf" })).toMatch(/empty/);
  });
});

describe("CareersFieldsSchema", () => {
  const ok = { firstName: "A", lastName: "B", email: "a@b.com", phone: "12345", experience: "2 years", position: "PPC Specialist" };
  it("accepts minimal fields and empty optional urls", () => {
    expect(CareersFieldsSchema.safeParse(ok).success).toBe(true);
    expect(CareersFieldsSchema.safeParse({ ...ok, linkedin: "", github: "" }).success).toBe(true);
  });
  it("rejects bad email and bad urls", () => {
    expect(CareersFieldsSchema.safeParse({ ...ok, email: "x" }).success).toBe(false);
    expect(CareersFieldsSchema.safeParse({ ...ok, linkedin: "nope" }).success).toBe(false);
  });
  it("bounds the honeypot", () => {
    expect(CareersFieldsSchema.safeParse({ ...ok, hp_field: "x".repeat(501) }).success).toBe(false);
  });
});
