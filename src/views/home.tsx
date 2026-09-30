import { stats } from "@/content";
import { ExperienceSection } from "@/features/experience/experience-section";

const copy = {
  hero: {
    eyebrow: "E-commerce growth agency",
    title: "Build. Grow. Scale.",
    subtitle: "We run Amazon, Meta and Google for e-commerce brands — as one growth engine.",
  },
  cards: stats.map((s) => ({ id: s.id, title: s.label, stat: s.value, description: s.description })),
  wave: {
    eyebrow: "One growth engine",
    title: "Amazon, Meta & Google — run as one",
    body: "Most brands run each channel in isolation. We connect marketplace, social and search so every dollar of spend lifts the others — with one team, one strategy and one report.",
  },
};

export const HomeView = () => (
  <main id="main">
    <ExperienceSection copy={copy} />
    <div className="h-lvh" />
  </main>
);
