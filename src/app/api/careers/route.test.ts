import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const ctx = { params: Promise.resolve({}) };
const form = (file: File | null, extra: Record<string, string> = {}, ip: string = crypto.randomUUID()) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ firstName: "A", lastName: "B", email: "a@b.com", phone: "12345", experience: "2 years", position: "PPC Specialist", ...extra })) fd.set(k, v);
  if (file) fd.set("resume", file);
  return new NextRequest("http://localhost/api/careers", { method: "POST", body: fd, headers: { "x-forwarded-for": ip } });
};
const pdf = () => new File(["%PDF-1.4"], "cv.pdf", { type: "application/pdf" });

describe("POST /api/careers", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/test/exec";
  });
  afterEach(() => vi.unstubAllGlobals());

  it("forwards base64 resume to the Apps Script", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const res = await POST(form(pdf()), ctx);
    expect(res.status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.resume).toMatch(/^data:application\/pdf;base64,/);
    expect(sent.position).toBe("PPC Specialist");
    expect(sent.hp_field).toBeUndefined();
  });
  it("derives the MIME type from the extension when the browser sends none", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const res = await POST(form(new File(["PK"], "cv.docx", { type: "" })), ctx);
    expect(res.status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.resume.startsWith("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,")).toBe(true);
  });
  it("returns the invalid_input envelope for a bad email", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const res = await POST(form(pdf(), { email: "x" }), ctx);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_input");
    expect(body.error.issues.some((i: { path: string }) => i.path === "email")).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("allows up to 25s for the upstream Apps Script", async () => {
    const spy = vi.spyOn(AbortSignal, "timeout");
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("ok")));
    const mod = await import("./route");
    await mod.POST(form(pdf()), ctx);
    expect(spy).toHaveBeenCalledWith(25_000);
    expect(mod.maxDuration).toBe(30);
    spy.mockRestore();
  });
  it("rejects oversized resumes with 400 before forwarding", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "cv.pdf", { type: "application/pdf" });
    const res = await POST(form(big), ctx);
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects wrong file types with 400", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const res = await POST(form(new File(["MZ"], "cv.exe", { type: "application/x-msdownload" })), ctx);
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("returns 400 when the resume is missing", async () => {
    const { POST } = await import("./route");
    expect((await POST(form(null), ctx)).status).toBe(400);
  });
  it("silently accepts honeypot submissions without sending", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const res = await POST(form(pdf(), { hp_field: "spam" }), ctx);
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("returns 502 with the fallback email when upstream is not ok", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("no", { status: 500 })));
    const { POST } = await import("./route");
    const res = await POST(form(pdf()), ctx);
    expect(res.status).toBe(502);
    expect((await res.json()).error.message).toContain("info@ecommercesteem.com");
    expect(spy).toHaveBeenCalledWith("[api/careers] upstream failed", 500);
    spy.mockRestore();
  });
  it("returns 502 with the fallback email when fetch rejects", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const { POST } = await import("./route");
    const res = await POST(form(pdf()), ctx);
    expect(res.status).toBe(502);
    expect((await res.json()).error.message).toContain("info@ecommercesteem.com");
    spy.mockRestore();
  });
  it("returns 502 when GOOGLE_SCRIPT_URL is not configured", async () => {
    delete process.env.GOOGLE_SCRIPT_URL;
    const { POST } = await import("./route");
    const res = await POST(form(pdf()), ctx);
    expect(res.status).toBe(502);
    expect((await res.json()).error.message).toContain("info@ecommercesteem.com");
  });
  it("rate limits after 3 requests per IP", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("ok")));
    const { POST } = await import("./route");
    for (let i = 0; i < 3; i++) expect((await POST(form(pdf(), {}, "9.9.9.9"), ctx)).status).toBe(200);
    expect((await POST(form(pdf(), {}, "9.9.9.9"), ctx)).status).toBe(429);
  });
});
