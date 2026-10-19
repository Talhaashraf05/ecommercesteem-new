import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content";

import { HeaderPill } from "./header-pill";
import { Logo } from "./logo";
import { NAV_LINK, NavLink } from "./nav-link";
import { MobileMenu } from "./mobile-menu";
import { serviceNav } from "./service-nav";
import { ServicesMenu } from "./services-menu";

export const SiteHeader = () => (
  // Fixed: stays on screen while HeaderPill widens the capsule to hold the logo and button.
  <header className="fixed inset-x-0 top-0 z-40">
    <div className="relative mx-auto flex h-18 max-w-page items-center justify-between px-gutter lg:grid lg:grid-cols-[1fr_auto_1fr]">
      <HeaderPill />
      <Logo />
      <nav
        aria-label="Primary"
        className="hidden items-center gap-1 rounded-full p-1.5 lg:flex"
      >
        <ServicesMenu groups={serviceNav} />
        <NavLink href="/work">Work</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/careers">Careers</NavLink>
        <a href={site.portal} className={NAV_LINK} target="_blank" rel="noopener noreferrer">
          Portal ↗
        </a>
      </nav>
      <div className="flex items-center gap-3 justify-self-end">
        <ButtonLink
          href="/contact"
          className="shadow-[0_0_1.5rem_color-mix(in_srgb,var(--brand)_45%,transparent)] ring-1 ring-inset ring-white/20 max-sm:hidden"
        >
          Book a free audit
        </ButtonLink>
        <MobileMenu groups={serviceNav} portal={site.portal} />
      </div>
    </div>
  </header>
);
