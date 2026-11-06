// 📖 Docs: obsidian/frontend/components/ui.md
import { AnimatedGradientBorder } from "./animated-gradient-border";

/**
 * Frosted pill label with a brand-accent dot and an animated shimmer ring —
 * the `.top-label` element from style.css.
 */
export interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

const SHIMMER_RING =
  "linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.08))";

export const Eyebrow = ({ children, className }: EyebrowProps) => (
  <span
    className={`relative inline-flex h-10 items-center gap-2 rounded-full bg-surface-glass px-5 text-eyebrow font-medium text-fg shadow-card backdrop-blur-md${
      className ? ` ${className}` : ""
    }`}
  >
    <AnimatedGradientBorder
      gradient={SHIMMER_RING}
      durationMs={3000}
      className="rounded-full"
    />
    <span
      aria-hidden="true"
      className="relative size-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_0_0.25rem_color-mix(in_srgb,var(--brand)_25%,transparent)]"
    />
    <span className="relative">{children}</span>
  </span>
);
