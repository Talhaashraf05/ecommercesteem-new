"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ACTIVE, NAV_LINK, isActive } from "./nav-styles";

export const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const active = isActive(usePathname(), href);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`${NAV_LINK} ${active ? NAV_ACTIVE : ""}`}>
      {children}
    </Link>
  );
};
