// 📖 Docs: obsidian/frontend/components/ui.md
/**
 * Inline icon set used by the home experience — ported verbatim from the
 * `<svg>` glyphs in the source index.html. `currentColor` lets them inherit
 * text colour; decorative by default (`aria-hidden`).
 */

export type IconProps = React.SVGProps<SVGSVGElement>;

/** Stacked-layers glyph shown in every eyebrow label. */
export const LayersIcon = ({ className, ...props }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

/** Diagonal arrow inside the primary button's circular badge. */
export const ArrowIcon = ({ className, ...props }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
    {...props}
  >
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

/* Service glyphs: 20px line icons used in the services menus. */
const ServiceGlyph = ({ className, children, ...props }: IconProps) => (
  <svg
    className={className}
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

/** Storefront. */
export const StorefrontIcon = (p: IconProps) => (
  <ServiceGlyph {...p}>
    <path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3M10 20v-5h4v5" />
  </ServiceGlyph>
);

/** Target. */
export const TargetIcon = (p: IconProps) => (
  <ServiceGlyph {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </ServiceGlyph>
);

/** Document with lines. */
export const DocumentIcon = (p: IconProps) => (
  <ServiceGlyph {...p}>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5M9 13h6M9 17h6" />
  </ServiceGlyph>
);

/** Chat bubble. */
export const ChatIcon = (p: IconProps) => (
  <ServiceGlyph {...p}>
    <path d="M20 12a8 8 0 01-11.6 7.1L4 20l1-4.1A8 8 0 1120 12z" />
  </ServiceGlyph>
);

/** Magnifier. */
export const SearchIcon = (p: IconProps) => (
  <ServiceGlyph {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </ServiceGlyph>
);

/** Envelope. */
export const MailIcon = (p: IconProps) => (
  <ServiceGlyph {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </ServiceGlyph>
);

/** Trending-up chart. */
export const TrendingUpIcon = (p: IconProps) => (
  <ServiceGlyph {...p}>
    <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
  </ServiceGlyph>
);
