// Plain (non-client) module so server components can read these class strings.
export const NAV_LINK =
  "relative inline-flex h-7 items-center rounded-full px-3 text-button text-muted transition-colors duration-200 hover:bg-surface-raised hover:text-fg";
export const NAV_ACTIVE =
  "text-fg after:absolute after:inset-x-3 after:-bottom-px after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand after:to-transparent";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
