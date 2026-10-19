/** Page copy for /work. Figures come from `stats` and `caseStudies` (both unverified). */
export const workPage = {
  hero: {
    eyebrow: "Work",
    title: "Brands we've grown",
    lead: "Selected case studies across Amazon and retention, with the numbers behind each one.",
    primary: { label: "Book a free audit", href: "/contact" },
    secondary: { label: "See all work", href: "#index" },
    /** `stats` entries shown under the hero, looked up by id. */
    statIds: ["clients", "countries", "projects"],
  },
  featured: {
    /** Case study given the editorial spotlight above the index. */
    slug: "sturdy-essentials",
    eyebrow: "Featured",
    challengeLabel: "The challenge",
    metricsLabel: "Key results",
    cta: "Read the case study",
  },
  index: {
    heading: "All work",
    /** Column labels over the index rows (desktop). */
    columns: { client: "Client", result: "Result", services: "Services" },
    filterLabel: "Filter case studies",
    /** `{n}` is the visible count; `{group}` the chip label, dropped for "All" so each change is re-announced. */
    count: "Showing {n} {group} case studies",
    countOne: "Showing 1 {group} case study",
    empty: "No case studies in this category yet.",
  },
  cta: {
    title: "Want results like these?",
    body: "Book a free audit and we'll show you where your brand's next growth is hiding.",
    primary: { label: "Book a free audit", href: "/contact" },
    secondary: { label: "Explore services", href: "/services" },
  },
};

/** Labels for /work/[slug]. Figures and story text come from each `caseStudies` entry (unverified). */
export const caseStudyPage = {
  metricsHeading: "Results",
  story: {
    challenge: "The challenge",
    approach: "What we did",
    outcome: "The outcome",
  },
  /** Accessible name of the story section; `{client}` is the case study's client. */
  storyLabel: "{client} story",
  services: "Services used",
  next: "Next case study",
  cta: {
    title: "Want results like these?",
    body: "Book a free audit and we'll show you where your brand's next growth is hiding.",
    primary: { label: "Book a free audit", href: "/contact" },
    secondary: { label: "All case studies", href: "/work" },
  },
};
