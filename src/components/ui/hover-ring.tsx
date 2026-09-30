"use client";

import { useState, useSyncExternalStore } from "react";
import { animated, useSpring } from "@react-spring/web";
import { AnimatedGradientBorder } from "./animated-gradient-border";

const RING = "linear-gradient(90deg, var(--brand), var(--brand-glow), var(--brand))";
const RM_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReduced = () => window.matchMedia(RM_QUERY).matches;

export interface HoverRingProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps a card and fades in an animated gradient ring on mouse hover or
 * keyboard focus within. Opacity is a declarative spring toggled by state;
 * touch pointers never trigger it, and reduced motion swaps instantly.
 */
export const HoverRing = ({ className, children }: HoverRingProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [armed, setArmed] = useState(false); // mount the ring (and its ticker loop) only after first use
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
  const active = hovered || focused;
  const style = useSpring({ opacity: active ? 1 : 0, immediate: reduced });

  return (
    <div
      className={`relative${className ? ` ${className}` : ""}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        setArmed(true);
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => {
        setArmed(true);
        setFocused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      {children}
      {armed && (
        <animated.div aria-hidden="true" style={style} className="pointer-events-none absolute inset-0 rounded-[inherit]">
          <AnimatedGradientBorder gradient={RING} durationMs={4000} thickness={2} className="rounded-[inherit]" />
        </animated.div>
      )}
    </div>
  );
};
