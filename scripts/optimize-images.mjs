import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const SRC = "../ecommercesteem-dev/public/images/";
const MAP = {
  "amazon-1": "amazon-1.jpg",
  "amazon-2": "amazon-2.jpg",
  ecommerce: "ecommerce-3562005_1920.jpg",
  "meta-ads": "man-8488203_1920.jpg",
  "google-ads": "google-ads.jpg",
  "email-marketing": "email-marketing.jpg",
  seo: "op.jpg",
  team: "about.jpg",
  "case-hulkfit": "office2.jpg",
  "case-nfinity": "jindal-marketing-10095618_1920.png",
  "case-sinkliners": "desk-3139127_1920.jpg",
  "case-huskey": "office3.jpg",
  "case-revival": "hand-shake.jpg",
  "case-bluestem": "pexels-leeloothefirst-6928994.jpg",
};

// Busy photos need a lower quality to stay under the size budget.
const QUALITY = { team: 64, "case-sinkliners": 62 };

// Fractional pre-crops [left, width] so the subject survives tall object-cover crops.
const CROP_X = { "meta-ads": [0.42, 0.58] };

mkdirSync("public/images", { recursive: true });
for (const [out, src] of Object.entries(MAP)) {
  const dest = `public/images/${out}.webp`;
  let img = sharp(SRC + src);
  if (CROP_X[out]) {
    const { width, height } = await img.metadata();
    const [l, w] = CROP_X[out];
    img = sharp(await img.extract({ left: Math.round(width * l), top: 0, width: Math.round(width * w), height }).toBuffer());
  }
  await img.resize({ width: 2000, withoutEnlargement: true }).webp({ quality: QUALITY[out] ?? 76 }).toFile(dest);
  const kb = Math.round(statSync(dest).size / 1024);
  console.log(`${dest} ${kb} KB${kb > 400 ? "  WARNING over 400 KB" : ""}`);
}
