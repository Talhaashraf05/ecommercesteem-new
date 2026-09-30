import { getServerEnv } from "@/env";
import { ApiError, handle } from "@/lib/api";
import { createRateLimiter } from "@/lib/rate-limit";
import { site } from "@/content";
import { CareersFieldsSchema, validateResume } from "@/features/careers-form/schema";

const allow = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 });
const FALLBACK = `We couldn't submit your application. Email your CV to ${site.email}.`;

export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) throw new ApiError(429, "rate_limited", "Too many applications. Please try again later.");

  const fd = await req.formData();
  if (fd.get("hp_field")) return { received: true };
  const { hp_field: _hp, ...fields } = CareersFieldsSchema.parse(
    Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")),
  );
  const file = fd.get("resume");
  if (!(file instanceof File)) throw new ApiError(400, "missing_resume", "Please attach your CV.");
  const problem = validateResume(file);
  if (problem) throw new ApiError(400, "invalid_resume", problem);

  const { GOOGLE_SCRIPT_URL } = getServerEnv();
  if (!GOOGLE_SCRIPT_URL) throw new ApiError(502, "not_configured", `Applications are temporarily unavailable. Email your CV to ${site.email}.`);

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const payload = {
    ...fields,
    linkedin: fields.linkedin ?? "",
    github: fields.github ?? "",
    expectedSalary: fields.expectedSalary ?? "",
    resume: `data:${file.type || "application/pdf"};base64,${base64}`,
  };
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[api/careers] upstream failed", res.status);
      throw new ApiError(502, "upstream_error", FALLBACK);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("[api/careers] upstream failed", "network");
    throw new ApiError(502, "upstream_error", FALLBACK);
  }
  return { received: true };
});
