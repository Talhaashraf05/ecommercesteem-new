import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const SRC = "../ecommercesteem/public/images/";
const MAP = {
  "stock/amazon-1": "amazon-1.jpg",
  "stock/amazon-2": "setup.jpg", // analytics dashboard (was a courier: contradicted no-freight)
  "stock/ecommerce": "ecommerce-3562005_1920.jpg",
  "stock/email-marketing": "email-marketing.jpg",
  "stock/seo": "op.jpg",
  "stock/team-work": "office.jpg",
  "case-studies/hulkfit": "office2.jpg",
  "case-studies/sinkliners": "op.jpg", // analytics close-up, a different crop from `seo` (was a tax form)
  "case-studies/huskey": "office3.jpg",
  "case-studies/revival": "hand-shake.jpg",
  "case-studies/bluestem": "work.jpg", // laptop in hand (was an IRS tax form)
};

// Busy photos need a lower quality to stay under the size budget.
const QUALITY = { "stock/team-work": 70 };

// Fractional pre-crops [left, top, width, height]: keep the subject in tall
// object-cover crops, or frame out third-party branding.
const CROP = {
  "case-studies/sinkliners": [0.42, 0.33, 0.58, 0.54],
};

// Optional CLI filter: `node scripts/optimize-images.mjs amazon-2 case-bluestem`.
const only = new Set(process.argv.slice(2));

mkdirSync("public/images", { recursive: true });
for (const d of ["stock", "case-studies"]) mkdirSync(`public/images/${d}`, { recursive: true });
for (const [out, src] of Object.entries(MAP)) {
  if (only.size && !only.has(out)) continue;
  const dest = `public/images/${out}.webp`;
  let img = sharp(SRC + src);
  if (CROP[out]) {
    const { width, height } = await img.metadata();
    const [l, t, w, h] = CROP[out];
    img = sharp(
      await img
        .extract({ left: Math.round(width * l), top: Math.round(height * t), width: Math.round(width * w), height: Math.round(height * h) })
        .toBuffer(),
    );
  }
  await img.resize({ width: 2000, withoutEnlargement: true }).webp({ quality: QUALITY[out] ?? 76 }).toFile(dest);
  const bytes = statSync(dest).size;
  console.log(`${dest} ${Math.round(bytes / 1000)} kB${bytes > 400_000 ? "  WARNING over 400 kB" : ""}`);
}
