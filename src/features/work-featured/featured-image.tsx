"use client";

// The featured case study's photo with a subtle scroll parallax: while the frame is in
// view, the shared ticker slides the (slightly oversized) photo from -4% to +4% of its
// height as the frame crosses the viewport, so it drifts against the page. Written
// straight to the DOM; nothing re-renders. Reduced motion: no subscription, static photo.
import { useEffect, useRef } from "react";
import Image from "next/image";
import { subscribeToTicker } from "@/lib/animation/ticker";

const RANGE = 4; // % of the photo's height, either side of centre

export const FeaturedImage = ({ src, alt }: { src: string; alt: string }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const layer = layerRef.current;
    if (!frame || !layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let last = Number.NaN;
    let unsubscribe: (() => void) | null = null;
    const tick = () => {
      const rect = frame.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the frame's top enters at the bottom, 1 as its bottom leaves at the top.
      const t = Math.min(Math.max((vh - rect.top) / Math.max(1, vh + rect.height), 0), 1);
      const shift = (t * 2 - 1) * RANGE;
      if (Math.abs(shift - last) < 0.01) return;
      last = shift;
      layer.style.transform = `translate3d(0, ${shift.toFixed(2)}%, 0)`;
    };

    const io = new IntersectionObserver((entries) => {
      const visible = entries[entries.length - 1]?.isIntersecting ?? false;
      if (visible && !unsubscribe) {
        unsubscribe = subscribeToTicker(tick, () => 0);
      } else if (!visible && unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    });
    io.observe(frame);
    return () => {
      io.disconnect();
      unsubscribe?.();
      layer.style.transform = "";
    };
  }, []);

  return (
    <div ref={frameRef} className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-line bg-surface shadow-card">
      {/* Oversized by 2×RANGE so the drift never shows an edge. The photos are ~3:2, so
          covering the frame needs ~1.25× its width on mobile (4:3) and ~2× at lg (4:5),
          hence `sizes`. */}
      <div ref={layerRef} className="absolute inset-x-0 -inset-y-[5%] will-change-transform motion-reduce:will-change-auto">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 75vw, 125vw" className="object-cover" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-line" />
    </div>
  );
};
