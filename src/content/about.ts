/** Page copy for /about. The story, mission and parent company come from `site.about`. */
export const aboutPage = {
  hero: {
    eyebrow: "About",
    title: "From vision to digital leadership",
    primary: { label: "Book a free audit", href: "/contact" },
    secondary: { label: "See our work", href: "/work" },
  },
  timeline: {
    eyebrow: "Our journey",
    heading: "How we got here",
  },
  stats: {
    photo: { src: "/images/team.webp", alt: "EcommerceSteem team at work" },
    /** `stats` entries by id (src/content/stats.ts). */
    collabStatId: "clients",
    collabDesc: "brands trust us with their Amazon, Meta and Google growth.",
    dataStatId: "projects",
    reachStatId: "countries",
    reachLabel: "Countries served",
    commitment: {
      eyebrow: "Client rating",
      value: "5.0★",
      /** Testimonial quoted on the card, looked up by `name` in src/content/testimonials.ts. */
      quoteAuthor: "Bill Parsons",
      initials: ["BI", "AE", "MD", "MS"],
    },
  },
  values: {
    heading: "What we stand for",
  },
  offices: {
    heading: "Where we work",
    lead: { text: "Three hubs across three continents, one team running your growth around the clock.", verified: false },
    /** `{name}` and `{address}` are filled from `site.parentCompany`. */
    parentLine: "EcommerceSteem is part of {name}, {address}.",
  },
  clientsLabel: "Brands we've grown",
  team: {
    heading: "The people behind the growth",
  },
  cta: {
    title: "Let's grow your brand",
    body: "Book a free audit and we'll show you where your next stage of growth is hiding.",
    primary: { label: "Book a free audit", href: "/contact" },
    secondary: { label: "Explore services", href: "/services" },
  },
};
