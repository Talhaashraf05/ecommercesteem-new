import type { TimelineItem } from "./schemas";

// Drafted from the spec; confirm every milestone with the owner before launch.
// `place` + lon/lat are the waypoints for the scroll-driven journey map. Real office
// coordinates are reused where they exist (see src/content/offices.ts); the rest are
// illustrative positions for the route — adjust with the owner.
export const timeline: TimelineItem[] = [
  { year: "2018", title: "Founded", body: "EcommerceSteem starts with a small team and its first e-commerce clients on Upwork.", place: "Lahore, Pakistan", lon: 74.36, lat: 31.52, verified: false },
  { year: "2020", title: "Amazon, end to end", body: "First Amazon brands under full account management — PPC, listings and account health.", place: "Dover, United States", lon: -75.52, lat: 39.16, verified: false },
  { year: "2022", title: "Albania office", body: "A second hub opens in Tiranë.", place: "Tiranë, Albania", lon: 19.82, lat: 41.33, verified: false },
  { year: "2023", title: "Email & SEO", body: "The Lahore team expands and email marketing and SEO join the Amazon practice.", place: "Lahore, Pakistan", lon: 74.36, lat: 31.52, verified: false },
  { year: "2024", title: "Dev Steem LTD", body: "The UK parent company is registered.", place: "Suffolk, United Kingdom", lon: 0.72, lat: 52.33, verified: false },
  { year: "Today", title: "500+ brands", body: "Brands grown across 70+ countries.", place: "70+ countries", lon: 18.8, lat: 39.2, verified: false },
];
