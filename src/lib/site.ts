import { publicEnv } from "@/env";

export const siteConfig = {
  name: "EcommerceSteem",
  description:
    "E-commerce growth agency. We run Amazon, Meta Ads and Google Ads for online brands — as one growth engine.",
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/opengraph-image",
  twitterHandle: "",
  author: "EcommerceSteem",
  themeColor: "#07070A",
} as const;
