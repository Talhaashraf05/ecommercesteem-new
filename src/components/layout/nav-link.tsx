"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_LINK =
  "relative rounded-full px-4 py-2 text-sm text-muted transition-colors duration-200 hover:text-fg";
export const NAV_ACTIVE =
  "text-fg after:absolute after:inset-x-4 after:-bottom-px after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand after:to-transparent";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const active = isActive(usePathname(), href);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`${NAV_LINK} ${active ? NAV_ACTIVE : ""}`}>
      {children}
    </Link>
  );
};
