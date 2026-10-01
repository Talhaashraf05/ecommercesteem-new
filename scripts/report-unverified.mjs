// Prebuild warning: lists content still flagged `verified: false`.
import { readFileSync } from "node:fs";

const files = ["src/content/case-studies.ts", "src/content/stats.ts", "src/content/timeline.ts", "src/content/careers.ts", "src/content/contact.ts", "src/content/about.ts"];
let count = 0;
for (const f of files) {
  const text = readFileSync(f, "utf8");
  const n = (text.match(/verified:\s*false/g) ?? []).length;
  if (n) console.warn(`⚠  ${f}: ${n} unverified entr${n === 1 ? "y" : "ies"} — verify before launch`);
  count += n;
}
if (!count) console.log("[report-unverified] all content verified");
