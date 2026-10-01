# EcommerceSteem: launch checklist

Everything here must be done or confirmed by the owner before the site goes live.
Do not deploy until the owner gives the go-ahead.

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

See `.env.example`.

| Variable | Scope | Required | Notes |
| --- | --- | --- | --- |
| `WEB3FORMS_ACCESS_KEY` | Server only | Yes | Contact form delivery (see §5). |
| `GOOGLE_SCRIPT_URL` | Server only | Yes | Apps Script endpoint that receives careers applications + CVs. |
| `NEXT_PUBLIC_SITE_URL` | Public | Yes | `https://ecommercesteem.com`. It is used for canonical URLs, the sitemap, OG tags and JSON-LD. A trailing slash is stripped; if it is empty or unset the site falls back to `https://$VERCEL_PROJECT_PRODUCTION_URL` (set automatically by Vercel), then to `http://localhost:3000`. Set it explicitly for production. |
| `NEXT_PUBLIC_GA_ID` | Public | **Optional** | GA4 ID (`G-XXXXXXX`). Leave empty and no analytics tag is rendered. |

Contact form honeypot field name: **`hp_field`** (used by both the contact and the careers
forms). The honeypot is handled entirely server-side, in `/api/contact` and `/api/careers`:
filled submissions get a 200 response and are dropped silently, and `hp_field` never reaches
Web3Forms or the Apps Script. There is nothing to configure for it on the Web3Forms side.

## 2. Verify before launch

`node scripts/report-unverified.mjs` (also printed at the start of every `yarn build`):

```
⚠  src/content/case-studies.ts: 6 unverified entries — verify before launch
⚠  src/content/stats.ts: 3 unverified entries — verify before launch
⚠  src/content/timeline.ts: 6 unverified entries — verify before launch
⚠  src/content/careers.ts: 4 unverified entries — verify before launch
⚠  src/content/contact.ts: 2 unverified entries — verify before launch
```

Every entry is `verified: false`. Confirm each number with the client or replace it, then set
`verified: true` in the content file.

### Stats (`src/content/stats.ts`, shown in the home hero cards, the stats bento and About)

| Stat | Value |
| --- | --- |
| Brands served | 500+ |
| Countries | 70+ |
| Projects delivered | 1000+ |
| **Client rating** (home stats bento, `src/views/home.tsx`) | **5.0★** |

### Case studies (`src/content/case-studies.ts`)

| Client | Headline metric | Other metrics |
| --- | --- | --- |
| HulkFit (2025) | +142% Amazon revenue in 6 months | −31% ACoS · +58% conversion rate · Top 10 rank for 12 core keywords |
| Nfinity (2025) | 4.1× blended ROAS | +96% online revenue · −27% cost per acquisition · 38 creatives tested per month |
| SinkLiners (2024) | 0 → 7-figure annualized Amazon run-rate | 14 ASINs launched · 4.6★ average rating · 100% account health score |
| Huskey Parts (2024) | +210% organic traffic | +64% Google Ads conversions · −22% cost per conversion · 1,200+ product pages optimized |
| Revival (2025) | 34% revenue from email | +48% repeat purchase rate · 9 automated flows live · 3.2× Meta retargeting ROAS |
| Bluestem (2024) | −38% wasted ad spend | +71% ad-attributed sales · 22% TACoS · 2 channels managed as one |

Also confirm the client names, categories, years, services, challenge/approach/outcome text,
and that each client agrees to be named.

### Copy claims

- **Amazon PPC FAQ** (`src/content/services.ts`): "Most accounts see wasted spend drop **within the
  first two weeks**; efficiency and rank gains build over **60–90 days**."
- **Home FAQ** (`src/content/faq.ts`): "…wasted spend reduced in the first weeks. Rank, ROAS and
  revenue gains typically build over **60–90 days**."
- **Email Marketing FAQ** (`src/content/services.ts`): flow names "welcome series, abandoned cart,
  post-purchase and win-back". Confirm these are the flows you actually build. The Revival case
  study separately lists "welcome, browse-abandon, cart-abandon and replenishment flows in Klaviyo".
- **Testimonials** (`src/content/testimonials.ts`): confirm names and quotes are real and
  approved. Amine El Aini's quote mentions "high-quality designs". Design isn't an offered
  service, so consider replacing it.

### About timeline (`src/content/timeline.ts`, the "How we got here" section on `/about`)

Drafted from the spec. Every milestone is `verified: false`; confirm the years and wording.

| Year | Milestone | Text |
| --- | --- | --- |
| 2018 | Founded | EcommerceSteem starts with a small team and its first e-commerce clients on Upwork. |
| 2020 | Amazon, end to end | First Amazon brands under full account management — PPC, listings and account health. |
| 2022 | Albania office | A second hub opens in Tiranë. |
| 2023 | Paid social & search | The Lahore team expands and Meta & Google Ads join the Amazon practice. |
| 2024 | Dev Steem LTD | The UK parent company is registered. |
| Today | 500+ brands | Brands grown across 70+ countries. |

### Hiring steps (`src/content/careers.ts` → `hiringSteps`, "How we hire" on `/careers`)

All four are `verified: false`. Confirm that this is the real process.

1. **Apply:** "Send your CV and a few lines about what you'd like to work on."
2. **Intro call:** "A 20-minute chat with the team about your experience and goals."
3. **Short task:** "A small, paid-time-respecting task close to the real work."
4. **Offer:** "We move quickly — most candidates hear back within a week."

### Inner-page copy (drafted, not flagged by the script)

- **`careersPage`** (`src/content/careers.ts`): all of its copy was drafted for the redesign.
  Confirm the hero ("Help ambitious brands grow"), "Life at EcommerceSteem" ("One team across
  three continents…", "Hubs on three continents, so someone is always moving a brand forward."),
  the roles copy and the empty state ("No open roles right now — but we're always meeting great
  people…"), "Four steps, no endless rounds." and the closing CTA.
- **`contactPage`** (`src/content/contact.ts`):
  - "What happens next" steps 2–3 are `verified: false`: **"Free audit call — 30 minutes on your
    account"** and **"Your growth plan — priorities, budget and timeline"**. Confirm that the audit
    call really is 30 minutes and free.
  - The trust line **"5.0 ★ · 7 verified reviews on Upwork & Clutch"** must match the live
    Upwork/Clutch profiles and `src/content/testimonials.ts`.
  - The closing CTA body ("Browse the brands we've grown on Amazon, Meta and Google…").
- **`workPage`** (`src/content/work.ts`):
  - The hero lead: "Selected case studies across Amazon, Meta, Google and retention, with the
    numbers behind each one."
  - The **featured study** is `huskey-parts` (`featured.slug`). Confirm Huskey Parts agrees to
    be the spotlight case, or change the slug.

### Team section (`/about`)

`src/content/team.ts` is empty on purpose, so the team section is hidden. **It appears
automatically** once `team` has entries (`{ name, role, photo }`). `photo` must be a path under
`public/images/` (for example `/images/team-jane.webp`). No code change is needed.

## 3. Images to replace with real ones

Stock photography is in use (`public/images/`, generated by `scripts/optimize-images.mjs`).
Replace the following with real photos. Keep a 16:10-ish crop, about 2000px wide, WebP, under 400 KB.

- **Team photo:** `team.webp` (home stats bento, "EcommerceSteem team at work").
- **Case study photos:** `case-hulkfit`, `case-nfinity`, `case-sinkliners`, `case-huskey`,
  `case-revival`, `case-bluestem`. Ideally use each client's product or brand imagery.
- **Off-brand props, replace first:**
  - `meta-ads`: a visible Apple logo (third-party branding).
  - Minor: `google-ads` shows a Polish-language UI.

  (`amazon-2`, `case-sinkliners` and `case-bluestem` were already swapped for neutral stock:
  an analytics dashboard, an analytics close-up and a laptop in hand. They are still stock.)

## 4. Prices to confirm

All prices are "starting at" monthly prices (`src/content/pricing.ts`). The downloadable PDFs
in `public/files/*-pricing.pdf` must match.

| Group | Tiers |
| --- | --- |
| Amazon (all three Amazon services) | Basic Support $500 · Advanced Support $889 · Professional Support $1,485 · Custom |
| Meta Ads | Starter $449 · Growth $749 · Enterprise $1,199 · Custom |
| Google Ads | Starter $349 · Growth $699 · Enterprise $998 · Custom |
| Email Marketing | Starter $749 · Growth $1,199 · Professional $1,799 · Custom |
| SEO | Silver $700 · Gold $1,500 · Platinum $2,800 · Custom |

The Amazon PPC and Amazon Listings pages show the shared Amazon account-management tiers. Confirm
that is intended.

## 5. Web3Forms (contact form)

1. Create a **fresh** Web3Forms access key. **Don't add a domain restriction:** the form is
   submitted server-side from `/api/contact`, so requests carry no browser `Origin` and a
   domain-restricted key would reject every message. Confirm your Web3Forms plan accepts
   server-side (API) submissions.
2. **Revoke the old public key.** It was shipped in the old Vite site's JavaScript bundle, so
   anyone can use it.
3. Set the new key as `WEB3FORMS_ACCESS_KEY` (server-only) in Vercel.
4. After deploy, send **one real test submission** from `/contact` and confirm it arrives at
   `info@ecommercesteem.com`. Also try `/contact?service=amazon-ppc&plan=Basic%20Support` and check
   that the service and plan arrive.

## 6. Careers (CV upload)

**Before launch: redeploy the Google Apps Script to a new URL.** The old URL was exposed in the
old site's JavaScript bundle (`VITE_GOOGLE_SCRIPT_URL`), so anyone can post to it. Create a new
deployment (Deploy → New deployment), disable the old one, and set the new `/exec` URL as
`GOOGLE_SCRIPT_URL` (server-only) in Vercel.

The CV limit is **4 MiB = 4,194,304 bytes** (below Vercel's 4.5 MB request cap). The upstream
call to the Apps Script may take up to 25 s (`maxDuration` is 30 s). After deploy:

- Upload a **~3.9 MB** PDF CV. It should be **accepted** and reach the Apps Script / Drive.
- Upload a CV of **at least 4.3 MB** (4.2 MB files can be under 4 MiB, depending on whether
  your OS counts MB as 1,000,000 or 1,048,576 bytes). The user should see the friendly message
  **"Your CV must be 4 MB or smaller."** and nothing is sent.
- Upload a `.docx` CV and check that it opens correctly from Drive.
- Optionally try a `.exe` (rejected with "Please upload a PDF, DOC or DOCX file.").

## 7. Final Lighthouse scores

Measured against `yarn build && yarn start` on localhost, headless Chrome. Mobile = Moto G
emulation (slow 4G, 4× CPU); desktop = `--preset=desktop`. `/` and `/contact` (mobile) were
re-measured on 2026-10-01 after the final fixes with Lighthouse 13.5.0 CLI; the other rows and the
desktop columns are from 2026-09-30 (Lighthouse 12.8.2) and predate the contrast fix. The `/work` row
below predates the inner-pages redesign; see "Inner pages after the redesign" for current numbers.

| Page | Mobile Perf | Mobile LCP (sim / applied) | Mobile CLS | Desktop Perf | A11y (m/d) | BP (m/d) | SEO (m/d) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 93 (98 applied) | 3.2 s / 1.6 s | 0 | 100 | 100 / 97 | 100 / 100 | 100 / 100 |
| `/services/amazon-ppc` | 94 (99 applied) | 3.1 s / 1.6 s | 0 | 100 | 96 / 96 | 100 / 100 | 100 / 100 |
| `/work` | 92 (98 applied) | 3.4 s / 1.6 s | 0 | 100 | 100 / 100 | 100 / 100 | 100 / 100 |
| `/contact` | 95 (99 applied) | 2.9 s / 1.6 s | 0 | 100 | 100 / 97 | 100 / 100 | 100 / 100 |

Targets: mobile Perf ≥ 90 ✅ · A11y/BP/SEO ≥ 95 ✅ · CLS < 0.05 ✅ · LCP < 2.5 s: ✅ with applied
throttling, ❌ in the default simulated run.

**About the simulated LCP.** Lighthouse's default simulation (Lantern) reports about 3 s. On localhost
every request finishes before the observed LCP (about 45 ms), so the simulator puts all
first-load JS chunks on the LCP critical path. With real, applied throttling
(`--throttling-method=devtools`, the same slow-4G/4× CPU profile) LCP is 1.6–1.7 s on all four
pages. The LCP elements are text (the hero lead or `<h1>`) on `/`, `/services/amazon-ppc` and
`/contact`, and the first portfolio backdrop on `/work` (now eager-loaded). Re-check with
PageSpeed Insights on the production URL after deploy.

**Colour contrast (resolved).** White text on the brand red used to be 4.24:1 (under AA). It
now sits on a darker token, `brand-strong` `#C02A1F` (5.37:1 with `fg`), with
`brand-strong-hover` `#A8241A` on hover. This covers primary buttons, the active pricing tab, the
"Most popular" badge, the skip link and the red stats card. **The rule** (also in `globals.css`):
`brand` `#DC3326` on the dark background passes AA only for large text (≥ 24px, or ≥ 18.66px
bold), so use it for accents, icons and large display text. Any white/`fg` text on a red fill
must use `brand-strong`.

### Inner pages after the redesign (2026-10-01)

Mobile, Lighthouse 12.8.2 CLI (default simulated throttling), `yarn build && yarn start`. Each
page was loaded once to warm the server, then measured 3 times with the host load average
below 5. The table shows the median of the 3 runs.

| Page | Mobile Perf (runs) | LCP (sim) | CLS | TBT | A11y | BP | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/about` | **93** (93 / 93 / 93) | 3.3 s | 0 | 19 ms | 100 | 100 | 100 |
| `/careers` | **93** (92 / 93 / 93) | 3.2 s | 0 | 65 ms | 100 | 100 | 100 |
| `/careers/full-stack-developer` | **94** (92 / 94 / 94) | 3.1 s | 0 | 7 ms | 100 | 100 | 69¹ |
| `/work` | **91** (91 / 91 / 92) | 3.4 s | 0 | 13 ms | 100 | 96² | 100 |
| `/work/hulkfit` | **94** (94 / 94 / 94) | 3.1 s | 0 | 9 ms | 100 | 96² | 100 |
| `/contact` | **90** (90 / 87 / 91); re-run at load < 3: **91** (92 / 91 / 90) | 3.5 s | 0 | 72 ms | 100 | 100 | 100 |

Targets: mobile Perf ≥ 90 ✅ · A11y/BP/SEO ≥ 95 ✅ on the five target pages · CLS < 0.05 ✅.
`/contact` scores at the edge of the target, so check it on PageSpeed Insights after deploy.

1. SEO 69 is intentional. Closed roles render `robots: noindex, follow`
   (`src/app/careers/[id]/page.tsx`), and every role is currently closed. Open roles are indexable.
2. BP 96 comes from the "legible font sizes" audit. `text-xs` renders at about 11.1px, which
   affects the work-index meta lines and the footer.

First-load JS (gzip -9 over the module `<script src>` chunks in `.next/server/app/<route>.html`,
excluding the noModule polyfill and the lazily loaded three.js chunk), after the inner-pages
redesign (2026-10-01):

| Route | Bytes | KiB |
| --- | --- | --- |
| `/` | 199,366 | 194.69 |
| `/about` | 197,079 | 192.46 |
| `/careers` | 193,266 | 188.74 |
| `/careers/[id]` (full-stack-developer) | 189,312 | 184.88 |
| `/work` | 193,496 | 188.96 |
| `/work/[slug]` (hulkfit) | 189,683 | 185.24 |
| `/contact` | 193,633 | 189.09 |

The budget is < 200 KiB per route, and home must not exceed 200,660 B. `/about` has only about
7.7 KiB of headroom, so check the budget before adding client-side code.

## 8. Post-deploy checks

1. **Redirects:** every legacy URL in `src/lib/redirects.ts` must return **308** to the right
   target. Run this and check each `location:` line:

   ```sh
   for p in /career /career-details/business-developer /career/form /casestudy /projects /project \
            /privacy-policy /services/amazon /services/ftl-shipping /services/web-development; do
     echo "$p"; curl -sI "https://ecommercesteem.com$p" | grep -iE '^(HTTP|location)'
   done
   ```

   Expected: `/career`, `/career/form` → `/careers`; `/career-details/<id>` → `/careers/<id>`;
   `/casestudy`, `/projects`, `/project` → `/work`; `/privacy-policy` → `/privacy`;
   `/services/amazon` → `/services/amazon-account-management`; `/services/ftl-shipping`,
   `/services/web-development` → `/services`.
2. **Security headers:** `curl -I https://ecommercesteem.com/` shows `x-content-type-options: nosniff`,
   `referrer-policy: strict-origin-when-cross-origin`, `content-security-policy: frame-ancestors 'self'`
   and `permissions-policy: camera=(), microphone=(), geolocation=()`.
3. **Google Search Console:** verify the domain and submit `https://ecommercesteem.com/sitemap.xml`.
4. **PageSpeed Insights** (mobile and desktop) on `/`, one service page (e.g.
   `/services/amazon-ppc`), `/work` and `/contact`. Compare with §7.
