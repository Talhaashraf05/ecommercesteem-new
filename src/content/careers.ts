import type { HiringStep } from "./schemas";

export const hiringSteps: HiringStep[] = [
  { title: "Apply", description: "Send your CV and a few lines about what you'd like to work on.", verified: false },
  { title: "Intro call", description: "A 20-minute chat with the team about your experience and goals.", verified: false },
  { title: "Short task", description: "A small, paid-time-respecting task close to the real work.", verified: false },
  { title: "Offer", description: "We move quickly — most candidates hear back within a week.", verified: false },
];

/** Page copy for /careers and the /careers/[id] job pages. */
export const careersPage = {
  hero: {
    eyebrow: "Careers",
    title: "Help ambitious brands grow",
    lead: "Come help us build the complete e-commerce growth solution for ambitious brands.",
    rolesCta: "See open roles",
    applyCta: "Send your CV",
  },
  life: {
    heading: "Life at EcommerceSteem",
    lead: "One team across three continents, held together by a few things we won't compromise on.",
    officesLabel: "Where we work",
    officesBody: "Hubs on three continents, so someone is always moving a brand forward.",
  },
  roles: {
    heading: "Open roles",
    lead: "Every role works directly with the brands we grow.",
    emptyHeading: "No open roles right now",
    emptyBody: "— but we're always meeting great people. Send your CV and we'll keep it on file.",
    generalHeading: "Don't see your role?",
    generalBody: "Send your CV anyway and we'll keep it on file for the next opening.",
    generalPosition: "General application",
  },
  hiring: {
    heading: "How we hire",
    lead: "Four steps, no endless rounds.",
  },
  cta: {
    title: "Not ready to apply?",
    body: "See the brands our team has grown, or get to know us first.",
    primary: { label: "See our work", href: "/work" },
    secondary: { label: "About us", href: "/about" },
  },
  job: {
    overviewHeading: "Overview",
    doHeading: "What you'll do",
    bringHeading: "What you'll bring",
    applyHeading: "Apply for this role",
    closedHeading: "This role is closed",
    closedBody: "We're no longer accepting applications for this position.",
    closedCta: "See all careers",
    backLabel: "All careers",
  },
};
