/**
 * Home page "Selected work" cards: the client thumbnails (public/images/case-*-thumb.webp).
 * The figures are the ones printed on each thumbnail (unverified). They link to /work
 * until these clients have case-study pages of their own.
 */
export interface HomeWorkItem {
  slug: string;
  client: string;
  headline: string;
  image: string;
  href: string;
}

export const homeWork: HomeWorkItem[] = [
  { slug: "amrita", client: "Amrita", headline: "-50% TACoS in 25 days", image: "/images/case-amrita-thumb.webp", href: "/work" },
  { slug: "lorafied", client: "LORAfied", headline: "$21K Launch-day sales", image: "/images/case-lorafied-thumb.webp", href: "/work" },
  { slug: "nfinity", client: "Nfinity", headline: "+44.7% Year-over-year sales growth", image: "/images/case-nfinity-thumb.webp", href: "/work" },
  { slug: "revival", client: "Revival", headline: "+66% Monthly net profit", image: "/images/case-revival-thumb.webp", href: "/work" },
  { slug: "sturdy-essentials", client: "Sturdy Essentials", headline: "+417% Net profit in three months", image: "/images/case-sturdy-essentials-thumb.webp", href: "/work" },
  { slug: "wondery-outdoors", client: "Wondery Outdoors", headline: "+182% Sales growth in 90 days", image: "/images/case-wondery-outdoors-thumb.webp", href: "/work" },
];
