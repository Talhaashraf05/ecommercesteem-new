// Pure maths for the testimonial wheel: card size, ring radius and centre from the
// section's size, the slot nearest the top of the ring, and the ticker's frame step.
// Geometry follows the GetLayers "Carousel Under The Radar" layout(), adapted per
// Task 20 (0.82 aspect, 21 slots, measured against the section, not the window).

export const SLOTS = 21; // 7 testimonials × 3 — cycles evenly round the ring
export const SLOT_DEG = 360 / SLOTS;
export const CARD_ASPECT = 0.82; // width / height
export const RADIUS_VW = 0.7; // ring radius as a fraction of section width…
export const RADIUS_MINK = 4; // …but never under this many card widths
export const TOP_OFFSET = 0.48; // top card's centre, as a fraction of section height
export const AUTO_SPIN = 0.05; // deg per 60 fps frame
export const DRAG = 0.16; // deg per px of horizontal drag
export const INERTIA = 0.94; // velocity kept per 60 fps frame

const REM = 16;
// Card height floor. The brief's 15rem gives a 12.3rem-wide card on phones, which
// clips the longer quotes to ~4 short lines; 19.5rem (a 16rem-wide card) fits the
// longest quote in 6 lines at 15.6px. Phones have the vertical room for it.
export const CARD_MIN_H = 19.5 * REM;
export const CARD_MAX_H = 26 * REM;

// Fixed vertical chrome inside a card: p-6 (2 × 24) + stars (16) + two gap-4 (2 × 16)
// + footer of up to three 20px lines (name, then source · location, date wrapping to two).
const CARD_CHROME = 48 + 16 + 32 + 60;
const QUOTE_LEADING = 1.625; // leading-relaxed
export const QUOTE_MIN_PX = 0.9375 * REM;
export const QUOTE_MAX_PX = 1.25 * REM;

export interface WheelLayout {
  /** Card width, px. */
  cw: number;
  /** Card height, px. */
  ch: number;
  /** Ring radius (wheel centre to card centre), px. */
  r: number;
  /** Wheel centre, px from the section top. */
  cy: number;
  /** Quote font size, px. */
  quoteSize: number;
  /** Whole quote lines that fit in the card. */
  quoteLines: number;
}

export const wheelLayout = (width: number, height: number): WheelLayout => {
  const ch = Math.max(CARD_MIN_H, Math.min(height * 0.42, width * 0.5, CARD_MAX_H));
  const cw = ch * CARD_ASPECT;
  const r = Math.max(width * RADIUS_VW, cw * RADIUS_MINK);
  const quoteSize = Math.min(QUOTE_MAX_PX, Math.max(QUOTE_MIN_PX, ch * 0.05));
  const quoteLines = Math.max(3, Math.floor((ch - CARD_CHROME) / (quoteSize * QUOTE_LEADING)));
  return { cw, ch, r, cy: TOP_OFFSET * height + r, quoteSize, quoteLines };
};

/** Wraps an angle into (-180, 180]. */
export const wrapDeg = (deg: number): number => {
  const a = (((deg + 180) % 360) + 360) % 360 - 180;
  return a === -180 ? 180 : a;
};

/**
 * Slot whose card sits nearest the top of the ring at wheel rotation `rot` (deg).
 * Card `i` is drawn at `i * SLOT_DEG + rot`; the top is 0°.
 */
export const nearestSlot = (rot: number, slots = SLOTS): number => {
  const step = 360 / slots;
  let best = Infinity;
  let bestSlot = 0;
  for (let i = 0; i < slots; i++) {
    const d = Math.abs(wrapDeg(i * step + rot));
    if (d < best) {
      best = d;
      bestSlot = i;
    }
  }
  return bestSlot;
};

/** Rotation that brings the slot `delta` places from the current top slot to the top. */
export const stepTarget = (rot: number, delta: number, slots = SLOTS): number => {
  const step = 360 / slots;
  return (Math.round(rot / step) - delta) * step;
};

/** Ticker delta as a count of 60 fps frames, clamped so a stalled tab can't lurch. */
export const frameSteps = (dtMs: number): number => Math.min(Math.max(dtMs, 0), 100) / (1000 / 60);

export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

export const pad2 = (n: number): string => String(n).padStart(2, "0");
