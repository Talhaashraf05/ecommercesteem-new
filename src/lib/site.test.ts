import { afterEach, describe, expect, it, vi } from "vitest";

const load = async (env: Record<string, string | undefined>) => {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v as string);
  return (await import("./site")).siteConfig.url;
};

describe("siteConfig.url", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("strips a trailing slash from NEXT_PUBLIC_SITE_URL", async () => {
    expect(await load({ NEXT_PUBLIC_SITE_URL: "https://x.com/" })).toBe("https://x.com");
  });
  it("treats an empty NEXT_PUBLIC_SITE_URL as unset and falls back to the Vercel production URL", async () => {
    expect(await load({ NEXT_PUBLIC_SITE_URL: "", VERCEL_PROJECT_PRODUCTION_URL: "ecommercesteem.vercel.app" })).toBe(
      "https://ecommercesteem.vercel.app",
    );
  });
  it("falls back to localhost when nothing is set", async () => {
    expect(await load({ NEXT_PUBLIC_SITE_URL: "", VERCEL_PROJECT_PRODUCTION_URL: "" })).toBe("http://localhost:3000");
  });
  it("prefers NEXT_PUBLIC_SITE_URL over the Vercel URL", async () => {
    expect(await load({ NEXT_PUBLIC_SITE_URL: "https://www.ecommercesteem.com", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe(
      "https://www.ecommercesteem.com",
    );
  });
});
