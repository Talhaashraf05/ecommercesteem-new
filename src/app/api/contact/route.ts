import { NextResponse } from "next/server";
import { getServerEnv } from "@/env";
import { ApiError, handle } from "@/lib/api";
import { createRateLimiter } from "@/lib/rate-limit";
import { site } from "@/content";
import { ContactSchema } from "@/features/contact-form/schema";

const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
const FALLBACK = `We couldn't send your message. Please email us at ${site.email}.`;

export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) throw new ApiError(429, "rate_limited", "Too many requests. Please try again in a few minutes.");

  const input = ContactSchema.parse(await req.json());
  if (input.website) return NextResponse.json({ data: { received: true } });

  const { WEB3FORMS_ACCESS_KEY } = getServerEnv();
  if (!WEB3FORMS_ACCESS_KEY) throw new ApiError(502, "not_configured", FALLBACK);

  const { website: _hp, ...lead } = input;
  let ok = false;
  try {
    const upstream = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New enquiry from ${lead.name}${lead.service ? ` — ${lead.service}` : ""}`,
        from_name: "EcommerceSteem website",
        ...lead,
      }),
    });
    const json = (await upstream.json().catch(() => ({}))) as { success?: boolean };
    ok = upstream.ok && json.success === true;
  } catch {
    ok = false;
  }
  if (!ok) throw new ApiError(502, "upstream_error", FALLBACK);
  return { received: true };
});
