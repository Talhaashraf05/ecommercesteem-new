import type { HiringStep } from "./schemas";

export const hiringSteps: HiringStep[] = [
  { title: "Apply", description: "Send your CV and a few lines about what you'd like to work on.", verified: false },
  { title: "Intro call", description: "A 20-minute chat with the team about your experience and goals.", verified: false },
  { title: "Short task", description: "A small, paid-time-respecting task close to the real work.", verified: false },
  { title: "Offer", description: "We move quickly — most candidates hear back within a week.", verified: false },
];
