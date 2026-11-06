"use client";

// 📖 Docs: obsidian/frontend/components/ui.md
import Link from "next/link";
import { useRef } from "react";
import { Hover } from "@/components/animation/springs/hover";
import { AnimatedGradientBorder } from "./animated-gradient-border";
import { buttonClasses } from "./button";
import { HoverArrow } from "./hover-arrow";

/**
 * Frosted-glass call-to-action button — the `.btn-primary` / `.btn-secondary`
 * pair from style.css.
 *
 * The source animated hover with `transition: all 0.2s` (a banned CSS
 * transition, hard rule #1), so the colour shift runs through the spring
 * `<Hover>` component instead; the arrow rotation lives in `HoverArrow`.
 * (spring `from`/`to` take raw animatable values, not class names — see
 * animation-system.md).
 */

const SURFACE_BUTTON = "rgba(30, 12, 12, 0.45)";
const SURFACE_BUTTON_HOVER = "rgba(50, 16, 16, 0.55)";

const ACCENT_RING =
  "linear-gradient(90deg, var(--brand), var(--brand-glow), var(--brand))";

const HOVER_CONFIG = { tension: 300, friction: 22 };

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  withArrow?: boolean;
  href?: string;
}

export const GlassButton = ({
  variant = "primary",
  withArrow = false,
  href,
  children,
  ...props
}: GlassButtonProps) => {
  // `Hover` types its passthrough as HTMLAttributes (no button-specific attrs),
  // so forward native button props (type, onClick, disabled…) via a cast.
  // `suppressHydrationWarning`: react-spring serialises the initial `from` style
  // (backgroundColor/borderColor expand to longhands) differently on server vs
  // client; the values converge on mount, so suppress the cosmetic mismatch.
  const buttonProps = {
    ...(href ? {} : { type: "button" as const }),
    suppressHydrationWarning: true,
    ...props,
  } as React.HTMLAttributes<HTMLElement>;
  // In link mode the Hover renders a span inside a Link (no nested interactives).
  const tag = href ? "span" : "button";
  // Owns the arrow's hover trigger so the arrow animates on any part of the button.
  const ref = useRef<HTMLElement>(null);
  const wrap = (node: React.ReactElement) =>
    href ? (
      <Link href={href} className="pointer-events-auto inline-flex">
        {node}
      </Link>
    ) : (
      node
    );

  if (variant === "secondary") {
    // Same hover as ButtonLink `secondary` (the client-portal button):
    // plain background colour change, no spring lift.
    const cls = `pointer-events-auto ${buttonClasses("secondary")}`;
    return href ? (
      <Link href={href} className={cls}>{children}</Link>
    ) : (
      <button type="button" className={cls} {...props}>{children}</button>
    );
  }

  return wrap(
    <Hover
      ref={ref}
      tag={tag}
      from={{ backgroundColor: SURFACE_BUTTON }}
      to={{ backgroundColor: SURFACE_BUTTON_HOVER }}
      config={HOVER_CONFIG}
      className="pointer-events-auto relative inline-flex h-9 cursor-pointer items-center justify-center gap-3 rounded-full pl-5 pr-1.5 text-button font-medium text-fg shadow-glass-btn backdrop-blur-2xl backdrop-saturate-150"
      {...buttonProps}
    >
      <AnimatedGradientBorder
        gradient={ACCENT_RING}
        durationMs={4000}
        className="rounded-full"
      />
      <span className="relative">{children}</span>
      {withArrow && (
        <span className="relative flex size-6 items-center justify-center rounded-full bg-surface-glass">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              padding: 1,
              backgroundImage:
                "linear-gradient(135deg, var(--brand-glow), var(--brand))",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          <HoverArrow className="relative size-3" trigger={ref} />
        </span>
      )}
    </Hover>
  );
};
