"use client";

// 📖 Docs: obsidian/frontend/components/ui.md
import Link from "next/link";
import { Hover } from "@/components/animation/springs/hover";
import { AnimatedGradientBorder } from "./animated-gradient-border";
import { ArrowIcon } from "./icons";

/**
 * Frosted-glass call-to-action button — the `.btn-primary` / `.btn-secondary`
 * pair from style.css.
 *
 * The source animated hover with `transition: all 0.2s` (a banned CSS
 * transition, hard rule #1), so the lift + colour shift run through the spring
 * `<Hover>` component instead. Colour literals mirror the tokens in globals.css
 * (spring `from`/`to` take raw animatable values, not class names — see
 * animation-system.md).
 */

const SURFACE_BUTTON = "rgba(30, 12, 12, 0.45)";
const SURFACE_BUTTON_HOVER = "rgba(50, 16, 16, 0.55)";
const SURFACE_GLASS = "rgba(255, 255, 255, 0.04)";
const SURFACE_GLASS_HOVER = "rgba(255, 255, 255, 0.08)";
const BORDER_GLASS = "rgba(255, 255, 255, 0.08)";
const BORDER_GLASS_STRONG = "rgba(255, 255, 255, 0.15)";
const TEXT_DIM = "rgba(255, 255, 255, 0.75)";
const TEXT_FULL = "rgba(255, 255, 255, 1)";

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
  const wrap = (node: React.ReactElement) =>
    href ? (
      <Link href={href} className="pointer-events-auto inline-flex">
        {node}
      </Link>
    ) : (
      node
    );

  if (variant === "secondary") {
    return wrap(
      <Hover
        tag={tag}
        from={{
          y: 0,
          backgroundColor: SURFACE_GLASS,
          color: TEXT_DIM,
          borderColor: BORDER_GLASS,
        }}
        to={{
          y: -2,
          backgroundColor: SURFACE_GLASS_HOVER,
          color: TEXT_FULL,
          borderColor: BORDER_GLASS_STRONG,
        }}
        config={HOVER_CONFIG}
        className="pointer-events-auto inline-flex h-14 cursor-pointer items-center justify-center rounded-full border px-8 text-button font-medium backdrop-blur-md"
        {...buttonProps}
      >
        {children}
      </Hover>
    );
  }

  return wrap(
    <Hover
      tag={tag}
      from={{ y: 0, backgroundColor: SURFACE_BUTTON }}
      to={{ y: -2, backgroundColor: SURFACE_BUTTON_HOVER }}
      config={HOVER_CONFIG}
      className="pointer-events-auto relative inline-flex h-14 cursor-pointer items-center justify-center gap-3 rounded-full pl-8 pr-4 text-button font-medium text-fg shadow-glass-btn backdrop-blur-2xl backdrop-saturate-150"
      {...buttonProps}
    >
      <AnimatedGradientBorder
        gradient={ACCENT_RING}
        durationMs={4000}
        className="rounded-full"
      />
      <span className="relative">{children}</span>
      {withArrow && (
        <span className="relative flex size-8 items-center justify-center rounded-full bg-surface-glass">
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
          <ArrowIcon className="relative size-3" />
        </span>
      )}
    </Hover>
  );
};
