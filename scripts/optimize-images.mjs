import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const SRC = "../ecommercesteem-dev/public/images/";
const MAP = {
  "amazon-1": "amazon-1.jpg",
  "amazon-2": "setup.jpg", // analytics dashboard (was a courier: contradicted no-freight)
  ecommerce: "ecommerce-3562005_1920.jpg",
  "email-marketing": "email-marketing.jpg",
  seo: "op.jpg",
  team: "about.jpg",
};

// Busy photos need a lower quality to stay under the size budget.
const QUALITY = { team: 64 };

// Fractional pre-crops [left, top, width, height]: keep the subject in tall
// object-cover crops, or frame out third-party branding.
const CROP = {
};

// Optional CLI filter: `node scripts/optimize-images.mjs amazon-2 case-bluestem`.
const only = new Set(process.argv.slice(2));

mkdirSync("public/images", { recursive: true });
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
