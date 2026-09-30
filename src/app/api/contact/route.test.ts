import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const req = (body: unknown, ip = "1.1.1.1") =>
  new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
const valid = { name: "Ann", email: "ann@shop.com", message: "We need help with Amazon PPC." };
const ctx = { params: Promise.resolve({}) };

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.WEB3FORMS_ACCESS_KEY = "test-key";
  });
  afterEach(() => vi.unstubAllGlobals());

  it("forwards a valid lead to Web3Forms with the server key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const res = await POST(req(valid), ctx);
    expect(res.status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.access_key).toBe("test-key");
    expect(sent.email).toBe("ann@shop.com");
  });

  it("silently accepts honeypot submissions without sending", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const res = await POST(req({ ...valid, hp_field: "http://spam" }, "2.2.2.2"), ctx);
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid input", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ ...valid, email: "x" }, "3.3.3.3"), ctx);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_input");
    expect(body.error.issues.some((i: { path: string }) => i.path === "email")).toBe(true);
  });

  it("returns 502 with the fallback email when upstream fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 500 })));
    const { POST } = await import("./route");
    const res = await POST(req(valid, "4.4.4.4"), ctx);
    expect(res.status).toBe(502);
    expect((await res.json()).error.message).toContain("info@ecommercesteem.com");
    expect(spy).toHaveBeenCalledWith("[api/contact] upstream failed", 500);
    spy.mockRestore();
  });

  it("returns 502 with the fallback email when fetch rejects", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const { POST } = await import("./route");
    const res = await POST(req(valid, "6.6.6.6"), ctx);
    expect(res.status).toBe(502);
    expect((await res.json()).error.message).toContain("info@ecommercesteem.com");
    spy.mockRestore();
  });

  it("returns 502 with the fallback email when upstream body is not JSON", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("<html>oops</html>", { status: 200 })));
    const { POST } = await import("./route");
    const res = await POST(req(valid, "7.7.7.7"), ctx);
    expect(res.status).toBe(502);
    expect((await res.json()).error.message).toContain("info@ecommercesteem.com");
    spy.mockRestore();
  });

  it("rate limits after 5 requests per IP", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response(JSON.stringify({ success: true }))));
    const { POST } = await import("./route");
    for (let i = 0; i < 5; i++) expect((await POST(req(valid, "5.5.5.5"), ctx)).status).toBe(200);
    expect((await POST(req(valid, "5.5.5.5"), ctx)).status).toBe(429);
  });
});
