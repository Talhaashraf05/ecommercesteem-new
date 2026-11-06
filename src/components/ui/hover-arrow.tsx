"use client";

import { Hover } from "@/components/animation/springs/hover";
import { ArrowIcon } from "./icons";

/**
 * Arrow that straightens from diagonal (↗) to horizontal-right (→) when the
 * owning button/link — passed as `trigger` — is hovered. Without `trigger`
 * it only reacts to hovering the arrow itself.
 */
export const HoverArrow = ({
  className,
  trigger,
}: {
  className?: string;
  trigger?: React.RefObject<HTMLElement | null>;
}) => (
  <Hover
    tag="span"
    trigger={trigger}
    from={{ rotate: 0 }}
    to={{ rotate: -45 }}
    config={{ tension: 300, friction: 22 }}
    className="inline-flex"
  >
    <ArrowIcon className={className} aria-hidden="true" />
  </Hover>
);
