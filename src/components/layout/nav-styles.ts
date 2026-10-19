// Plain (non-client) module so server components can read these class strings.
export const NAV_LINK =
  "relative rounded-full px-4 py-2 text-sm text-muted transition-colors duration-200 hover:text-fg";
export const NAV_ACTIVE =
  "text-fg after:absolute after:inset-x-4 after:-bottom-px after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand after:to-transparent";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
