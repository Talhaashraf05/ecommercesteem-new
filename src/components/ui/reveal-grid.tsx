"use client";

import { Children, type ElementType } from "react";
import { animated } from "@react-spring/web";
import { useRevealCascade } from "@/components/common/use-reveal-cascade";

const RISE = 24; // px children rise from
const BLUR = 12; // px soft start blur

const extra = (c: RevealGridProps["itemClassName"], i: number) => {
  const v = typeof c === "function" ? c(i) : c;
  return v ? ` ${v}` : "";
};

export interface RevealGridProps {
  as?: ElementType;
  className?: string;
  /** Element wrapping each child. Use "li" with `as="ul"`/`"ol"`. */
  itemAs?: "div" | "li";
  /** Classes for each wrapper (e.g. grid `col-span-*`), optionally per index. */
  itemClassName?: string | ((index: number) => string);
  children: React.ReactNode;
}

/**
 * Container whose direct children cascade in on scroll (opacity, rise, blur).
 * Children are SSR-visible; each is wrapped in an element (`itemAs`) that carries
 * the animated style and stretches to fill its grid cell. Put grid-item classes
 * such as `col-span-*` on the wrapper via `itemClassName`. For lists, use
 * `as="ul"`/`"ol"` with `itemAs="li"` and put the li's content inside as children.
 */
export const RevealGrid = ({
  as: Tag = "div",
  className,
  itemAs = "div",
  itemClassName,
  children,
}: RevealGridProps) => {
  const items = Children.toArray(children);
  const Item = animated[itemAs];
  const { p, rootRef, localProg } = useRevealCascade<HTMLElement>(items.length);
  const done = (v: number, i: number) => localProg(v, i) >= 1;
  return (
    <Tag ref={rootRef} className={className}>
      {items.map((child, i) => (
        <Item
          key={i}
          className={`h-full${extra(itemClassName, i)}`}
          style={{
            opacity: p.to((v) => localProg(v, i)),
            // Once revealed, drop transform/filter/will-change entirely: any of them makes
            // the wrapper a backdrop root, which breaks backdrop-blur on glass cards inside.
            transform: p.to((v) => (done(v, i) ? "none" : `translateY(${RISE * (1 - localProg(v, i))}px)`)),
            filter: p.to((v) => (done(v, i) ? "none" : `blur(${BLUR * (1 - localProg(v, i))}px)`)),
            willChange: p.to((v) => (done(v, i) ? "auto" : "transform, opacity, filter")),
          }}
        >
          {child}
        </Item>
      ))}
    </Tag>
  );
};
