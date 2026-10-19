import { publicEnv } from "@/env";

// NEXT_PUBLIC_SITE_URL, else Vercel's production domain (set automatically on
// Vercel builds), else local dev.
const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const url =
  publicEnv.NEXT_PUBLIC_SITE_URL ?? (vercelProduction ? `https://${vercelProduction}` : "http://localhost:3000");

export const siteConfig = {
  name: "EcommerceSteem",
  description:
    "E-commerce growth agency. We run Amazon, email and SEO for online brands — as one growth engine.",
  url,
  ogImage: "/opengraph-image",
  twitterHandle: "",
  author: "EcommerceSteem",
  themeColor: "#07070A",
} as const;
