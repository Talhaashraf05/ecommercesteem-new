"use client";

import { Children, type ElementType } from "react";
import { animated } from "@react-spring/web";
import { useRevealCascade } from "@/components/common/use-reveal-cascade";

const RISE = 24; // px children rise from
const BLUR = 12; // px soft start blur

export interface RevealGridProps {
  as?: ElementType;
  className?: string;
  children: React.ReactNode;
}

/**
 * Container whose direct children cascade in on scroll (opacity, rise, blur).
 * Children are SSR-visible; each is wrapped in a plain div that carries the
 * animated style, so the container's grid/flex classes still lay them out.
 */
export const RevealGrid = ({ as: Tag = "div", className, children }: RevealGridProps) => {
  const items = Children.toArray(children);
  const { p, rootRef, localProg } = useRevealCascade<HTMLElement>(items.length);
  return (
    <Tag ref={rootRef} className={className}>
      {items.map((child, i) => (
        <animated.div
          key={i}
          style={{
            opacity: p.to((v) => localProg(v, i)),
            transform: p.to((v) => `translateY(${RISE * (1 - localProg(v, i))}px)`),
            filter: p.to((v) => `blur(${BLUR * (1 - localProg(v, i))}px)`),
            willChange: "transform, opacity",
          }}
        >
          {child}
        </animated.div>
      ))}
    </Tag>
  );
};
