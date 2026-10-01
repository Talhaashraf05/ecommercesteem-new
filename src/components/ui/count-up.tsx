"use client";

import { useEffect, useMemo, useRef } from "react";
import { easeOutQuart } from "@/lib/animation/cascade";
import { formatCount, parseCount } from "@/lib/animation/count";
import { subscribeToTicker } from "@/lib/animation/ticker";

const DURATION = 1400; // ms

export interface CountUpProps {
  /** Final text, e.g. "500+" or "4.1×". Server-rendered as-is; counts up once on scroll-in. */
  value: string;
  className?: string;
}

/**
 * Counts the single number inside `value` from 0 on first scroll-in, driven by
 * the shared ticker. Strings without exactly one number, and reduced motion,
 * render `value` untouched. The final frame always equals `value`.
 */
export const CountUp = ({ value, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = useMemo(() => parseCount(value), [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let unsubscribe = () => {};
    const run = () => {
      let t0: number | null = null;
      el.textContent = formatCount(parsed, 0);
      unsubscribe = subscribeToTicker(
        (time) => {
          if (t0 === null) t0 = time;
          const t = Math.min((time - t0) / DURATION, 1);
          el.textContent = t >= 1 ? value : formatCount(parsed, parsed.value * easeOutQuart(t));
          if (t >= 1) unsubscribe();
        },
        () => 0,
      );
    };

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      unsubscribe();
      el.textContent = value;
    };
  }, [parsed, value]);

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {value}
      </span>
    </span>
  );
};
